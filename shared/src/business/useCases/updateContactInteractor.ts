import { Case } from '../entities/cases/Case';
import {
  DOCKET_SECTION,
  DOCUMENT_PROCESSING_STATUS_OPTIONS,
  SERVICE_INDICATOR_TYPES,
} from '../entities/EntityConstants';
import { DocketEntry } from '../entities/DocketEntry';
import {
  NotFoundError,
  UnauthorizedError,
} from '../../../../web-api/src/errors/errors';
import { WorkItem } from '../entities/WorkItem';
import { addCoverToPdf } from './addCoverToPdf';
import { aggregatePartiesForService } from '../utilities/aggregatePartiesForService';
import { cloneDeep, isEmpty } from 'lodash';
import { getCaseCaptionMeta } from '../utilities/getCaseCaptionMeta';

/**
 * updateContactInteractor
 *
 * this interactor is invoked when a petitioner updates a case they are associated with from the parties tab.
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.docketNumber the docket number of the case to update the primary contact
 * @param {object} providers.contactInfo the contact info to update on the case
 * @returns {object} the updated case
 */
export const updateContactInteractor = async (
  applicationContext,
  { contactInfo, docketNumber },
) => {
  const user = applicationContext.getCurrentUser();

  const editableFields = {
    address1: contactInfo.address1,
    address2: contactInfo.address2,
    address3: contactInfo.address3,
    city: contactInfo.city,
    country: contactInfo.country,
    countryType: contactInfo.countryType,
    phone: contactInfo.phone,
    postalCode: contactInfo.postalCode,
    state: contactInfo.state,
  };

  const caseToUpdate = await applicationContext
    .getPersistenceGateway()
    .getCaseByDocketNumber({
      applicationContext,
      docketNumber,
    });

  if (!caseToUpdate) {
    throw new NotFoundError(`Case ${docketNumber} was not found.`);
  }

  let caseEntity = new Case(
    {
      ...caseToUpdate,
    },
    { applicationContext },
  );

  const oldCaseContact = cloneDeep(
    caseEntity.getPetitionerById(contactInfo.contactId),
  );

  const updatedCaseContact = {
    ...oldCaseContact,
    ...editableFields,
  };

  try {
    caseEntity.updatePetitioner(updatedCaseContact);
  } catch (e) {
    throw new NotFoundError(e);
  }

  const rawUpdatedCase = caseEntity.validate().toRawObject();
  caseEntity = new Case(rawUpdatedCase, { applicationContext });

  const updatedPetitioner = caseEntity.getPetitionerById(contactInfo.contactId);

  const userIsAssociated = caseEntity.isAssociatedUser({
    user,
  });

  if (!userIsAssociated) {
    throw new UnauthorizedError('Unauthorized for update case contact');
  }

  const documentType = applicationContext
    .getUtilities()
    .getDocumentTypeForAddressChange({
      newData: editableFields,
      oldData: oldCaseContact,
    });

  if (
    !oldCaseContact.isAddressSealed &&
    documentType &&
    caseEntity.shouldGenerateNoticesForCase()
  ) {
    const { caseCaptionExtension, caseTitle } = getCaseCaptionMeta(caseEntity);

    const changeOfAddressPdf = await applicationContext
      .getDocumentGenerators()
      .changeOfAddress({
        applicationContext,
        content: {
          caseCaptionExtension,
          caseTitle,
          docketNumber: caseEntity.docketNumber,
          docketNumberWithSuffix: caseEntity.docketNumberWithSuffix,
          documentTitle: documentType.title,
          documentType,
          name: contactInfo.name,
          newData: contactInfo,
          oldData: oldCaseContact,
        },
      });

    const newDocketEntryId = applicationContext.getUniqueId();

    const changeOfAddressDocketEntry = new DocketEntry(
      {
        addToCoversheet: true,
        additionalInfo: `for ${updatedPetitioner.name}`,
        docketEntryId: newDocketEntryId,
        docketNumber: caseEntity.docketNumber,
        documentTitle: documentType.title,
        documentType: documentType.title,
        eventCode: documentType.eventCode,
        filers: [updatedPetitioner.contactId],
        isAutoGenerated: true,
        isFileAttached: true,
        isOnDocketRecord: true,
        partyPrimary: true,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
        userId: user.userId,
      },
      { applicationContext, petitioners: caseEntity.petitioners },
    );

    const servedParties = aggregatePartiesForService(caseEntity);

    changeOfAddressDocketEntry.setAsServed(servedParties.all);

    const isContactRepresented = Case.isPetitionerRepresented(
      caseEntity,
      contactInfo.contactId,
    );

    const partyWithPaperService = caseEntity.hasPartyWithServiceType(
      SERVICE_INDICATOR_TYPES.SI_PAPER,
    );

    if (!isContactRepresented || partyWithPaperService) {
      const workItem = new WorkItem(
        {
          assigneeId: null,
          assigneeName: null,
          associatedJudge: caseEntity.associatedJudge,
          caseStatus: caseEntity.status,
          caseTitle: Case.getCaseTitle(caseEntity.caseCaption),
          docketEntry: {
            ...changeOfAddressDocketEntry.toRawObject(),
            createdAt: changeOfAddressDocketEntry.createdAt,
          },
          docketNumber: caseEntity.docketNumber,
          docketNumberWithSuffix: caseEntity.docketNumberWithSuffix,
          section: DOCKET_SECTION,
          sentBy: user.name,
          sentByUserId: user.userId,
          trialDate: caseEntity.trialDate,
          trialLocation: caseEntity.trialLocation,
        },
        { applicationContext },
        caseEntity,
      );

      changeOfAddressDocketEntry.setWorkItem(workItem);

      await applicationContext.getPersistenceGateway().saveWorkItem({
        applicationContext,
        workItem: workItem.validate().toRawObject(),
      });
    }

    caseEntity.addDocketEntry(changeOfAddressDocketEntry);

    const { pdfData: changeOfAddressPdfWithCover } = await addCoverToPdf({
      applicationContext,
      caseEntity,
      docketEntryEntity: changeOfAddressDocketEntry,
      pdfData: changeOfAddressPdf,
    });

    changeOfAddressDocketEntry.numberOfPages = await applicationContext
      .getUseCaseHelpers()
      .countPagesInDocument({
        applicationContext,
        documentBytes: changeOfAddressPdfWithCover,
      });

    await applicationContext.getUseCaseHelpers().sendServedPartiesEmails({
      applicationContext,
      caseEntity,
      docketEntryId: changeOfAddressDocketEntry.docketEntryId,
      servedParties,
    });

    await applicationContext.getPersistenceGateway().saveDocumentFromLambda({
      applicationContext,
      document: changeOfAddressPdfWithCover,
      key: newDocketEntryId,
    });
  }

  const contactDiff = applicationContext.getUtilities().getAddressPhoneDiff({
    newData: editableFields,
    oldData: oldCaseContact,
  });

  const shouldUpdateCase = !isEmpty(contactDiff) || documentType;

  if (shouldUpdateCase) {
    await applicationContext.getUseCaseHelpers().updateCaseAndAssociations({
      applicationContext,
      caseToUpdate: caseEntity,
    });
  }

  return caseEntity.toRawObject();
};
