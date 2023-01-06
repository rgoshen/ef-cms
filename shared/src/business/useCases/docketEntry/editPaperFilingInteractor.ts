import { Case } from '../../entities/cases/Case';
import {
  DOCKET_SECTION,
  DOCUMENT_RELATIONSHIPS,
} from '../../entities/EntityConstants';
import { DocketEntry } from '../../entities/DocketEntry';
import { NotFoundError, UnauthorizedError } from '../../../errors/errors';
import {
  ROLE_PERMISSIONS,
  isAuthorized,
} from '../../../authorization/authorizationClientService';
import { aggregatePartiesForService } from '../../utilities/aggregatePartiesForService';

/**
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {object} providers.documentMetadata the document metadata
 * @param {Boolean} providers.isSavingForLater true if saving for later, false otherwise
 * @param {string} providers.docketEntryId the id of the docket entry
 * @returns {object} The paper service PDF url
 */
export const editPaperFilingInteractor = async (
  applicationContext: IApplicationContext,
  {
    docketEntryId,
    documentMetadata,
    isSavingForLater,
  }: {
    documentMetadata: any;
    isSavingForLater: boolean;
    docketEntryId: string;
  },
) => {
  const authorizedUser = applicationContext.getCurrentUser();

  if (!isAuthorized(authorizedUser, ROLE_PERMISSIONS.DOCKET_ENTRY)) {
    throw new UnauthorizedError('Unauthorized');
  }

  const user = await applicationContext
    .getPersistenceGateway()
    .getUserById({ applicationContext, userId: authorizedUser.userId });

  const caseToUpdate = await applicationContext
    .getPersistenceGateway()
    .getCaseByDocketNumber({
      applicationContext,
      docketNumber: documentMetadata.docketNumber,
    });

  const caseEntity = new Case(caseToUpdate, { applicationContext });

  const currentDocketEntry = caseEntity.getDocketEntryById({
    docketEntryId,
  });

  if (!currentDocketEntry) {
    throw new NotFoundError(`Docket entry ${docketEntryId} was not found.`);
  } else if (currentDocketEntry.servedAt) {
    throw new Error('Docket entry has already been served');
  }

  if (!isSavingForLater) {
    if (currentDocketEntry.isPendingService) {
      throw new Error('Docket entry is already being served');
    } else {
      await applicationContext
        .getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus({
          applicationContext,
          docketEntryId: currentDocketEntry.docketEntryId,
          docketNumber: caseToUpdate.docketNumber,
          status: true,
        });
    }
  }

  try {
    const editableFields = {
      addToCoversheet: documentMetadata.addToCoversheet,
      additionalInfo: documentMetadata.additionalInfo,
      additionalInfo2: documentMetadata.additionalInfo2,
      attachments: documentMetadata.attachments,
      certificateOfService: documentMetadata.certificateOfService,
      certificateOfServiceDate: documentMetadata.certificateOfServiceDate,
      documentTitle: documentMetadata.documentTitle,
      documentType: documentMetadata.documentType,
      eventCode: documentMetadata.eventCode,
      filers: documentMetadata.filers,
      freeText: documentMetadata.freeText,
      freeText2: documentMetadata.freeText2,
      hasOtherFilingParty: documentMetadata.hasOtherFilingParty,
      isFileAttached: documentMetadata.isFileAttached,
      lodged: documentMetadata.lodged,
      mailingDate: documentMetadata.mailingDate,
      objections: documentMetadata.objections,
      ordinalValue: documentMetadata.ordinalValue,
      otherFilingParty: documentMetadata.otherFilingParty,
      partyIrsPractitioner: documentMetadata.partyIrsPractitioner,
      pending: documentMetadata.pending,
      receivedAt: documentMetadata.receivedAt,
      scenario: documentMetadata.scenario,
      serviceDate: documentMetadata.serviceDate,
    };

    const docketEntryEntity = new DocketEntry(
      {
        ...currentDocketEntry,
        ...editableFields,
        docketEntryId,
        editState: JSON.stringify(editableFields),
        isOnDocketRecord: true,
        relationship: DOCUMENT_RELATIONSHIPS.PRIMARY,
        userId: user.userId,
      },
      { applicationContext, petitioners: caseEntity.petitioners },
    );

    let paperServicePdfUrl;

    if (editableFields.isFileAttached) {
      const { workItem } = docketEntryEntity;

      Object.assign(workItem, {
        caseStatus: caseToUpdate.status,
        docketEntry: {
          ...docketEntryEntity.toRawObject(),
          createdAt: docketEntryEntity.createdAt,
        },
        docketNumber: caseToUpdate.docketNumber,
        docketNumberSuffix: caseToUpdate.docketNumberSuffix,
        inProgress: isSavingForLater,
      });

      workItem.assignToUser({
        assigneeId: user.userId,
        assigneeName: user.name,
        section: user.section,
        sentBy: user.name,
        sentBySection: user.section,
        sentByUserId: user.userId,
      });

      if (!isSavingForLater) {
        workItem.setAsCompleted({
          message: 'completed',
          user,
        });

        const servedParties = aggregatePartiesForService(caseEntity);
        docketEntryEntity.setAsServed(servedParties.all);
        docketEntryEntity.setAsProcessingStatusAsCompleted();

        caseEntity.updateDocketEntry(docketEntryEntity);

        const paperServiceResult = await applicationContext
          .getUseCaseHelpers()
          .serveDocumentAndGetPaperServicePdf({
            applicationContext,
            caseEntities: [caseEntity],
            docketEntryId: docketEntryEntity.docketEntryId,
          });

        if (servedParties.paper.length > 0) {
          paperServicePdfUrl = paperServiceResult && paperServiceResult.pdfUrl;
        }
      } else {
        docketEntryEntity.numberOfPages = await applicationContext
          .getUseCaseHelpers()
          .countPagesInDocument({
            applicationContext,
            docketEntryId,
          });

        await applicationContext.getPersistenceGateway().saveWorkItem({
          applicationContext,
          workItem: workItem.validate().toRawObject(),
        });
      }

      await applicationContext
        .getPersistenceGateway()
        .saveWorkItemForDocketClerkFilingExternalDocument({
          applicationContext,
          workItem: workItem.validate().toRawObject(),
        });
    } else if (!editableFields.isFileAttached && isSavingForLater) {
      const { workItem } = docketEntryEntity;

      Object.assign(workItem, {
        assigneeId: null,
        assigneeName: null,
        caseStatus: caseToUpdate.status,
        docketEntry: {
          ...docketEntryEntity.toRawObject(),
          createdAt: docketEntryEntity.createdAt,
        },
        docketNumber: caseToUpdate.docketNumber,
        docketNumberSuffix: caseToUpdate.docketNumberSuffix,
        inProgress: isSavingForLater,
        section: DOCKET_SECTION,
        sentBy: user.userId,
      });

      workItem.assignToUser({
        assigneeId: user.userId,
        assigneeName: user.name,
        section: user.section,
        sentBy: user.name,
        sentBySection: user.section,
        sentByUserId: user.userId,
      });

      await applicationContext.getPersistenceGateway().saveWorkItem({
        applicationContext,
        workItem: workItem.validate().toRawObject(),
      });
    }

    caseEntity.updateDocketEntry(docketEntryEntity);

    await applicationContext.getUseCaseHelpers().updateCaseAndAssociations({
      applicationContext,
      caseToUpdate: caseEntity,
    });

    if (!isSavingForLater) {
      await applicationContext
        .getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus({
          applicationContext,
          docketEntryId: currentDocketEntry.docketEntryId,
          docketNumber: caseToUpdate.docketNumber,
          status: false,
        });
    }

    return {
      paperServicePdfUrl,
    };
  } catch (e) {
    if (!isSavingForLater) {
      await applicationContext
        .getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus({
          applicationContext,
          docketEntryId: currentDocketEntry.docketEntryId,
          docketNumber: caseToUpdate.docketNumber,
          status: false,
        });
    }

    throw e;
  }
};
