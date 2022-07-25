const { post } = require('../requests');

/**
 * addDraftStampOrderDocketEntryInteractor
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.docketNumber the docket number of the case on which to save the document
 * @param {string} providers.originalDocketEntryId the id of the original (unsigned) document
 * @param {string} providers.signedDocketEntryId the id of the signed document
 * @param {string} providers.stampData the stampData from the form to add to the draft order
 * @returns {Promise<*>} the promise of the api call
 */
exports.addDraftStampOrderDocketEntryInteractor = (
  applicationContext,
  { docketNumber, originalDocketEntryId, signedDocketEntryId, stampData },
) => {
  return post({
    applicationContext,
    body: {
      signedDocketEntryId,
      stampData,
    },
    endpoint: `/case-documents/${docketNumber}/${originalDocketEntryId}/stamp`,
  });
};
