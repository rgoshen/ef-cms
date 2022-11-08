const { post } = require('../requests');

/**
 * addPaperFilingProxy
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {object} providers.data the data being forwarded to the API call
 * @returns {Promise<*>} the promise of the api call
 */
exports.addPaperFilingInteractor = (applicationContext, data) => {
  const { documentMetadata } = data;
  const { docketNumber } = documentMetadata;

  return post({
    applicationContext,
    body: data,
    endpoint: `/case-documents/${docketNumber}/paper-filing`,
  });
};
