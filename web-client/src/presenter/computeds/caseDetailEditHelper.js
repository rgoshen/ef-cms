import { state } from 'cerebral';
import { showContactsHelper } from '../computeds/showContactsHelper';

/**
 * gets the case detail view options based on partyType
 * and documents
 *
 * @param {Function} get the cerebral get function used
 * for getting state.caseDetail.partyType and state.constants
 * @returns {Object} partyTypes constant, showPrimary/SecondaryContact,
 * showOwnershipDisclosureStatement, and ownershipDisclosureStatementDocumentId
 */
export const caseDetailEditHelper = get => {
  const { PARTY_TYPES } = get(state.constants);
  const partyType = get(state.caseDetail.partyType);
  const documents = get(state.caseDetail.documents);
  const showModal = get(state.showModal);
  const caseTitle = get(state.caseDetail.caseTitle);
  const { CASE_CAPTION_POSTFIX } = get(state.constants);
  const caseCaption = get(state.caseCaption);

  const showContacts = showContactsHelper(partyType, PARTY_TYPES);

  let showOwnershipDisclosureStatement = false;
  let ownershipDisclosureStatementDocumentId;

  if (
    [
      PARTY_TYPES.partnershipAsTaxMattersPartner,
      PARTY_TYPES.partnershipOtherThanTaxMatters,
      PARTY_TYPES.partnershipBBA,
      PARTY_TYPES.corporation,
    ].includes(partyType) &&
    documents
  ) {
    const odsDocs = documents.filter(document => {
      return document.documentType === 'Ownership Disclosure Statement';
    });
    if (odsDocs[0]) {
      showOwnershipDisclosureStatement = true;
      ownershipDisclosureStatementDocumentId = odsDocs[0].documentId;
    }
  }

  let caseCaptionValue;
  if (showModal == 'UpdateCaseCaptionModalDialog') {
    caseCaptionValue = caseTitle.replace(CASE_CAPTION_POSTFIX, '').trim();
  } else {
    caseCaptionValue = caseCaption;
  }

  return {
    caseCaptionValue,
    ownershipDisclosureStatementDocumentId,
    partyTypes: PARTY_TYPES,
    showOwnershipDisclosureStatement,
    showPrimaryContact: showContacts.contactPrimary,
    showSecondaryContact: showContacts.contactSecondary,
  };
};
