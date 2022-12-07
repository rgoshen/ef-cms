import { omit } from 'lodash';
import { state } from 'cerebral';

/**
 * resets the state.form which is used throughout the app for storing html form values
 * state.form is used throughout the app for storing html form values
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Function} providers.get the cerebral get helper function
 * @param {object} providers.props the cerebral props object
 * @returns {Promise} async action
 */
export const completeDocketEntryQCAction = async ({
  applicationContext,
  get,
  props,
}) => {
  const { docketNumber, leadDocketNumber } = get(state.caseDetail);
  const docketEntryId = get(state.docketEntryId);
  const { overridePaperServiceAddress } = props;

  let entryMetadata = omit(
    {
      ...get(state.form),
    },
    ['workitem', 'dateReceivedMonth', 'dateReceivedDay', 'dateReceivedYear'],
  );

  entryMetadata = {
    ...entryMetadata,
    createdAt: entryMetadata.dateReceived,
    docketEntryId,
    docketNumber,
    leadDocketNumber,
    overridePaperServiceAddress,
    receivedAt: entryMetadata.dateReceived,
  };

  const {
    caseDetail,
    paperServiceDocumentTitle,
    paperServiceParties,
    paperServicePdfUrl,
  } = await applicationContext
    .getUseCases()
    .completeDocketEntryQCInteractor(applicationContext, {
      entryMetadata,
    });

  const updatedDocument = caseDetail.docketEntries.filter(
    doc => doc.docketEntryId === docketEntryId,
  )[0];

  const descriptionDisplay = applicationContext
    .getUtilities()
    .getDescriptionDisplay(updatedDocument, true);

  return {
    alertSuccess: {
      // TODO: Decide implementation.
      // message: `${descriptionDisplay} has been completed.`,
      // title: 'QC Completed',
      message: `${descriptionDisplay} QC completed and message sent.`,
    },
    caseDetail,
    docketNumber,
    paperServiceDocumentTitle,
    paperServiceParties,
    pdfUrl: paperServicePdfUrl,
    updatedDocument,
  };
};
