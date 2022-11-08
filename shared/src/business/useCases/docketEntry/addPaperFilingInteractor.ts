import {
  ALLOWLIST_FEATURE_FLAGS,
  DOCKET_SECTION,
  DOCUMENT_RELATIONSHIPS,
  DOCUMENT_SERVED_MESSAGES,
  ROLES,
} from '../../entities/EntityConstants';
import { Case, isLeadCase } from '../../entities/cases/Case';
import { DocketEntry } from '../../entities/DocketEntry';
import {
  ROLE_PERMISSIONS,
  isAuthorized,
} from '../../../authorization/authorizationClientService';
import { UnauthorizedError } from '../../../errors/errors';
import { WorkItem } from '../../entities/WorkItem';
import { aggregatePartiesForService } from '../../utilities/aggregatePartiesForService';

/**
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {object} providers.clientConnectionId the client connection Id
 * @param {string} providers.docketEntryId the id of the docket entry to add
 * @param {object} providers.consolidatedGroupDocketNumbers the docket numbers from the consolidated group
 * @param {object} providers.documentMetadata the document metadata
 * @param {boolean} providers.isSavingForLater flag for saving docket entry for later instead of serving it
 * @returns {object} the updated case after the documents are added
 */
export const addPaperFilingInteractor = async (
  applicationContext: IApplicationContext,
  {
    clientConnectionId,
    consolidatedGroupDocketNumbers,
    docketEntryId,
    documentMetadata,
    isSavingForLater,
  }: {
    clientConnectionId: string;
    consolidatedGroupDocketNumbers: string[];
    documentMetadata: any;
    isSavingForLater: boolean;
    docketEntryId: string;
  },
) => {
  const authorizedUser = applicationContext.getCurrentUser();

  if (!isAuthorized(authorizedUser, ROLE_PERMISSIONS.DOCKET_ENTRY)) {
    throw new UnauthorizedError('Unauthorized');
  }

  if (!docketEntryId) {
    throw new Error('Did not receive a docketEntryId');
  }

  if (!documentMetadata) {
    throw new Error('Did not receive meta data for docket entry');
  }

  const { docketNumber: subjectCaseDocketNumber, isFileAttached } =
    documentMetadata;

  const isCaseConsolidationFeatureOn = await applicationContext
    .getUseCases()
    .getFeatureFlagValueInteractor(applicationContext, {
      featureFlag: ALLOWLIST_FEATURE_FLAGS.MULTI_DOCKETABLE_PAPER_FILINGS.key,
    });

  if (!isCaseConsolidationFeatureOn) {
    consolidatedGroupDocketNumbers = [subjectCaseDocketNumber];
  }

  const readyForService = documentMetadata.isFileAttached && !isSavingForLater;

  const docketRecordEditState =
    documentMetadata.isFileAttached === false ? documentMetadata : {};

  const user = await applicationContext
    .getPersistenceGateway()
    .getUserById({ applicationContext, userId: authorizedUser.userId });

  let caseEntities = [];
  let filedByFromLeadCase;

  for (const docketNumber of consolidatedGroupDocketNumbers) {
    const rawCase = await applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber({
        applicationContext,
        docketNumber,
      });

    const caseEntity = new Case(rawCase, { applicationContext });

    const servedParties = aggregatePartiesForService(caseEntity);

    const docketEntryEntity = new DocketEntry(
      {
        ...documentMetadata,
        docketEntryId,
        documentTitle: documentMetadata.documentTitle,
        documentType: documentMetadata.documentType,
        editState: JSON.stringify(docketRecordEditState),
        filingDate: documentMetadata.receivedAt,
        isOnDocketRecord: true,
        mailingDate: documentMetadata.mailingDate,
        relationship: DOCUMENT_RELATIONSHIPS.PRIMARY,
        userId: user.userId,
      },
      { applicationContext, petitioners: caseEntity.petitioners },
    );

    if (isLeadCase(caseEntity)) {
      filedByFromLeadCase = docketEntryEntity.filedBy;
    }

    if (filedByFromLeadCase) {
      docketEntryEntity.filedBy = filedByFromLeadCase;
    }

    const workItem = new WorkItem(
      {
        assigneeId: null,
        assigneeName: null,
        associatedJudge: caseEntity.associatedJudge,
        caseStatus: caseEntity.status,
        caseTitle: Case.getCaseTitle(caseEntity.caseCaption),
        docketEntry: {
          ...docketEntryEntity.toRawObject(),
          createdAt: docketEntryEntity.createdAt,
        },
        docketNumber: caseEntity.docketNumber,
        docketNumberWithSuffix: caseEntity.docketNumberWithSuffix,
        inProgress: isSavingForLater,
        isRead: user.role !== ROLES.privatePractitioner,
        leadDocketNumber: caseEntity.leadDocketNumber,
        section: DOCKET_SECTION,
        sentBy: user.name,
        sentByUserId: user.userId,
      },
      { applicationContext },
    );

    docketEntryEntity.setWorkItem(workItem);

    workItem.assignToUser({
      assigneeId: user.userId,
      assigneeName: user.name,
      section: user.section,
      sentBy: user.name,
      sentBySection: user.section,
      sentByUserId: user.userId,
    });

    if (readyForService) {
      docketEntryEntity.setAsServed(servedParties.all);
    }

    if (isFileAttached) {
      docketEntryEntity.numberOfPages = await applicationContext
        .getUseCaseHelpers()
        .countPagesInDocument({
          applicationContext,
          docketEntryId,
        });
    }

    caseEntity.addDocketEntry(docketEntryEntity);
    const aCaseEntity = await applicationContext
      .getUseCaseHelpers()
      .updateCaseAutomaticBlock({
        applicationContext,
        caseEntity,
      });

    await applicationContext.getUseCaseHelpers().updateCaseAndAssociations({
      applicationContext,
      caseToUpdate: aCaseEntity.validate().toRawObject(),
    });

    if (readyForService) {
      workItem.setAsCompleted({
        message: 'completed',
        user,
      });
    }

    await saveWorkItem({
      applicationContext,
      isSavingForLater,
      workItem,
    });
  }

  let paperServicePdfUrl;

  if (readyForService) {
    const paperServiceResult = await applicationContext
      .getUseCaseHelpers()
      .serveDocumentAndGetPaperServicePdf({
        applicationContext,
        caseEntities,
        docketEntryId,
      });

    paperServicePdfUrl = paperServiceResult && paperServiceResult.pdfUrl;
  }

  const successMessage =
    consolidatedGroupDocketNumbers.length > 1
      ? DOCUMENT_SERVED_MESSAGES.SELECTED_CASES
      : DOCUMENT_SERVED_MESSAGES.ENTRY_ADDED;

  await applicationContext.getNotificationGateway().sendNotificationToUser({
    applicationContext,
    clientConnectionId,
    message: {
      action: 'serve_document_complete',
      alertSuccess: {
        message: successMessage,
        overwritable: false,
      },
      docketEntryId,
      generateCoversheet: readyForService,
      pdfUrl: paperServicePdfUrl,
    },
    userId: user.userId,
  });
};

/**
 * Helper function to save any work items required when filing this docket entry
 *
 * @param {object} providers  The providers Object
 * @param {object} providers.applicationContext The application Context
 * @param {boolean} providers.isSavingForLater Whether or not we are saving these work items for later
 * @param {object} providers.workItem The work item we are saving
 */
const saveWorkItem = async ({
  applicationContext,
  isSavingForLater,
  workItem,
}) => {
  const workItemRaw = workItem.validate().toRawObject();
  const { isFileAttached } = workItem.docketEntry;

  if (isFileAttached && !isSavingForLater) {
    await applicationContext
      .getPersistenceGateway()
      .saveWorkItemForDocketClerkFilingExternalDocument({
        applicationContext,
        workItem: workItemRaw,
      });
  } else {
    await applicationContext.getPersistenceGateway().saveWorkItem({
      applicationContext,
      workItem: workItemRaw,
    });
  }
};
