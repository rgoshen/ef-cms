const {
  isAuthorized,
  ROLE_PERMISSIONS,
} = require('../../../authorization/authorizationClientService');
const { IRS_BATCH_SYSTEM_SECTION } = require('../../entities/WorkQueue');
const { UnauthorizedError } = require('../../../errors/errors');
const { User } = require('../../entities/User');

/**
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {string} providers.section the section to get the document qc served box
 * @returns {object} the work items in the section document served inbox
 */
exports.getDocumentQCServedForSectionInteractor = async ({
  applicationContext,
  section,
}) => {
  const user = applicationContext.getCurrentUser();

  if (!isAuthorized(user, ROLE_PERMISSIONS.WORKITEM)) {
    throw new UnauthorizedError(
      'Unauthorized for getting completed work items',
    );
  }

  const workItems = await applicationContext
    .getPersistenceGateway()
    .getDocumentQCServedForSection({
      applicationContext,
      section,
    });

  return workItems.filter(workItem =>
    user.role === User.ROLES.petitionsClerk
      ? workItem.section === IRS_BATCH_SYSTEM_SECTION
      : true,
  );
};
