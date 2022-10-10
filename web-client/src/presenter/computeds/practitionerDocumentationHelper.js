import { state } from 'cerebral';

export const practitionerDocumentationHelper = (get, applicationContext) => {
  const permissions = get(state.permissions);
  const practitionerDocuments = get(state.practitionerDocuments);

  const formattedPractitionerDocuments = practitionerDocuments.map(document => {
    return {
      ...document,
      formattedUploadDate: applicationContext
        .getUtilities()
        .formatDateString(document.uploadDate, 'MMDDYY'),
    };
  });

  return {
    formattedPractitionerDocuments,
    showDocumentationTab: permissions.UPLOAD_PRACTITIONER_DOCUMENT,
  };
};
