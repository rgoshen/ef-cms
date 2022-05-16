const {
  aggregatePartiesForService,
} = require('../../utilities/aggregatePartiesForService');
const {
  CASE_STATUS_TYPES,
  DOCUMENT_PROCESSING_STATUS_OPTIONS,
  SYSTEM_GENERATED_DOCUMENT_TYPES,
  TRIAL_SESSION_PROCEEDING_TYPES,
} = require('../../entities/EntityConstants');
const { DocketEntry } = require('../../entities/DocketEntry');

const serveNoticesForCase = async (
  applicationContext,
  {
    caseEntity,
    newPdfDoc,
    noticeDocketEntryEntity,
    noticeDocumentPdfData,
    PDFDocument,
    servedParties,
  },
) => {
  await applicationContext.getUseCaseHelpers().sendServedPartiesEmails({
    applicationContext,
    caseEntity,
    docketEntryId: noticeDocketEntryEntity.docketEntryId,
    servedParties,
  });

  if (servedParties.paper.length > 0) {
    const noticeDocumentPdf = await PDFDocument.load(noticeDocumentPdfData);

    await applicationContext
      .getUseCaseHelpers()
      .appendPaperServiceAddressPageToPdf({
        applicationContext,
        caseEntity,
        newPdfDoc,
        noticeDoc: noticeDocumentPdf,
        servedParties,
      });
  }
};

/**
 * setNoticeOfChangeToRemoteProceeding
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {object} providers.caseEntity the case data
 * @param {object} providers.currentTrialSession the old trial session data
 * @param {object} providers.newPdfDoc the new PDF contents to be appended
 * @param {object} providers.newTrialSessionEntity the new trial session data
 * @param {object} providers.PDFDocument the PDF document to append to
 * @param {object} providers.userId the user ID
 * @returns {Promise<void>} the created trial session
 */
exports.setNoticeOfChangeToRemoteProceeding = async (
  applicationContext,
  { caseEntity, newPdfDoc, newTrialSessionEntity, PDFDocument, userId },
) => {
  const trialSessionInformation = {
    chambersPhoneNumber: newTrialSessionEntity.chambersPhoneNumber,
    joinPhoneNumber: newTrialSessionEntity.joinPhoneNumber,
    judgeName: newTrialSessionEntity.judge.name,
    meetingId: newTrialSessionEntity.meetingId,
    password: newTrialSessionEntity.password,
    startDate: newTrialSessionEntity.startDate,
    startTime: newTrialSessionEntity.startTime,
    trialLocation: newTrialSessionEntity.trialLocation,
  };

  const notice = await applicationContext
    .getUseCases()
    .generateNoticeOfChangeToRemoteProceedingInteractor(applicationContext, {
      docketNumber: caseEntity.docketNumber,
      trialSessionInformation,
    });

  const docketEntryId = applicationContext.getUniqueId();

  await applicationContext.getPersistenceGateway().saveDocumentFromLambda({
    applicationContext,
    document: notice,
    key: docketEntryId,
  });

  const noticeOfChangeToRemoteProceedingDocketEntry = new DocketEntry(
    {
      date: newTrialSessionEntity.startDate,
      docketEntryId,
      documentTitle:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToRemoteProceeding
          .documentTitle,
      documentType:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToRemoteProceeding
          .documentType,
      eventCode:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToRemoteProceeding
          .eventCode,
      isAutoGenerated: true,
      isFileAttached: true,
      isOnDocketRecord: true,
      processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
      signedAt: applicationContext.getUtilities().createISODateString(),
      trialLocation: newTrialSessionEntity.trialLocation,
      userId,
    },
    { applicationContext },
  );

  noticeOfChangeToRemoteProceedingDocketEntry.numberOfPages =
    await applicationContext.getUseCaseHelpers().countPagesInDocument({
      applicationContext,
      docketEntryId: noticeOfChangeToRemoteProceedingDocketEntry.docketEntryId,
    });

  caseEntity.addDocketEntry(noticeOfChangeToRemoteProceedingDocketEntry);
  const servedParties = aggregatePartiesForService(caseEntity);

  noticeOfChangeToRemoteProceedingDocketEntry.setAsServed(servedParties.all);

  await serveNoticesForCase(applicationContext, {
    PDFDocument,
    caseEntity,
    newPdfDoc,
    noticeDocketEntryEntity: noticeOfChangeToRemoteProceedingDocketEntry,
    noticeDocumentPdfData: notice,
    servedParties,
  });
};
