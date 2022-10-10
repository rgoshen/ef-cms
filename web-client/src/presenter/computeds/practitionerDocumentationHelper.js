import { state } from 'cerebral';

export const practitionerDocumentationHelper = get => {
  const documentationCategory = get(state.form.categoryType);
  const permissions = get(state.permissions);

  console.log('documentationCategory', documentationCategory);

  const isCertificateOfGoodStanding =
    documentationCategory === 'Certificate of Good Standing';

  return {
    isCertificateOfGoodStanding,
    showDocumentationTab: permissions.UPLOAD_PRACTITIONER_DOCUMENT,
  };
};
