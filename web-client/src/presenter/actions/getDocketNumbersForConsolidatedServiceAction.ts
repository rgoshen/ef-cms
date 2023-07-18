import { state } from '@web-client/presenter/app.cerebral';

/**
 * gets docket numbers of all checked consolidated cases for shared docket entry service
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Function} providers.get the cerebral get function
 * @returns {object} the list of docketNumbers
 */
export const getDocketNumbersForConsolidatedServiceAction = ({
  applicationContext,
  get,
}: ActionProps) => {
  const {
    NON_MULTI_DOCKETABLE_EVENT_CODES,
    SIMULTANEOUS_DOCUMENT_EVENT_CODES,
  } = applicationContext.getConstants();
  const { isLeadCase } = applicationContext.getUtilities();

  const consolidatedCases =
    get(state.modal.form.consolidatedCasesToMultiDocketOn) || [];

  let docketNumbers = consolidatedCases
    .filter(consolidatedCase => consolidatedCase.checked)
    .filter(consolidatedCase => !isLeadCase(consolidatedCase))
    .map(consolidatedCase => consolidatedCase.docketNumber);

  const caseDetail = get(state.caseDetail);
  const { docketEntries } = caseDetail;
  const docketEntryId = get(state.docketEntryId);
  const { eventCode } = get(state.form);

  const isSimultaneousDocType =
    SIMULTANEOUS_DOCUMENT_EVENT_CODES.includes(eventCode) ||
    docketEntries
      .find(d => d.docketEntryId === docketEntryId)
      .documentTitle.includes('Simultaneous');

  if (
    !isLeadCase(caseDetail) ||
    NON_MULTI_DOCKETABLE_EVENT_CODES.includes(eventCode) ||
    isSimultaneousDocType
  ) {
    docketNumbers = [];
  }

  return { docketNumbers };
};
