const ROLE_PERMISSIONS = {
  ADD_CASE_TO_TRIAL_SESSION: 'ADD_CASE_TO_TRIAL_SESSION',
  ARCHIVE_DOCUMENT: 'ARCHIVE_DOCUMENT',
  ASSIGN_WORK_ITEM: 'ASSIGN_WORK_ITEM',
  ASSOCIATE_SELF_WITH_CASE: 'ASSOCIATE_SELF_WITH_CASE',
  ASSOCIATE_USER_WITH_CASE: 'ASSOCIATE_USER_WITH_CASE',
  BATCH_DOWNLOAD_TRIAL_SESSION: 'BATCH_DOWNLOAD_TRIAL_SESSION',
  BLOCK_CASE: 'BLOCK_CASE',
  CASE_DEADLINE: 'CASE_DEADLINE',
  COURT_ISSUED_DOCUMENT: 'COURT_ISSUED_DOCUMENT',
  CREATE_USER: 'CREATE_USER',
  DOCKET_ENTRY: 'DOCKET_ENTRY',
  FILE_EXTERNAL_DOCUMENT: 'FILE_EXTERNAL_DOCUMENT',
  GET_CASE: 'GET_CASE',
  GET_READ_MESSAGES: 'GET_READ_MESSAGES',
  GET_USERS_IN_SECTION: 'GET_USERS_IN_SECTION',
  PETITION: 'PETITION',
  PRIORITIZE_CASE: 'PRIORITIZE_CASE',
  SEND_TO_IRS_HOLDING_QUEUE: 'SEND_TO_IRS_HOLDING_QUEUE',
  SERVE_DOCUMENT: 'SERVE_DOCUMENT',
  START_PAPER_CASE: 'START_PAPER_CASE',
  TRIAL_SESSION_WORKING_COPY: 'TRIAL_SESSION_WORKING_COPY',
  TRIAL_SESSIONS: 'TRIAL_SESSIONS',
  UPDATE_CASE: 'UPDATE_CASE',
  UPDATE_CONTACT_INFO: 'UPDATE_CONTACT_INFO',
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  VIEW_DOCUMENTS: 'VIEW_DOCUMENTS',
  WORKITEM: 'WORKITEM',
};

exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;

const allInternalUserPermissions = [
  ROLE_PERMISSIONS.ADD_CASE_TO_TRIAL_SESSION,
  ROLE_PERMISSIONS.ARCHIVE_DOCUMENT,
  ROLE_PERMISSIONS.ASSOCIATE_USER_WITH_CASE,
  ROLE_PERMISSIONS.BLOCK_CASE,
  ROLE_PERMISSIONS.CASE_DEADLINE,
  ROLE_PERMISSIONS.COURT_ISSUED_DOCUMENT,
  ROLE_PERMISSIONS.GET_CASE,
  ROLE_PERMISSIONS.GET_CASES_BY_DOCUMENT_ID,
  ROLE_PERMISSIONS.GET_READ_MESSAGES,
  ROLE_PERMISSIONS.GET_USERS_IN_SECTION,
  ROLE_PERMISSIONS.PRIORITIZE_CASE,
  ROLE_PERMISSIONS.TRIAL_SESSIONS,
  ROLE_PERMISSIONS.UPDATE_CASE,
  ROLE_PERMISSIONS.UPLOAD_DOCUMENT,
  ROLE_PERMISSIONS.VIEW_DOCUMENTS,
  ROLE_PERMISSIONS.WORKITEM,
];

const AUTHORIZATION_MAP = {
  adc: allInternalUserPermissions,
  admin: [ROLE_PERMISSIONS.CREATE_USER],
  admissionsclerk: allInternalUserPermissions,
  calendarclerk: allInternalUserPermissions,
  chambers: [
    ...allInternalUserPermissions,
    ROLE_PERMISSIONS.BATCH_DOWNLOAD_TRIAL_SESSION,
    ROLE_PERMISSIONS.TRIAL_SESSION_WORKING_COPY,
  ],
  clerkofcourt: [
    ...allInternalUserPermissions,
    ROLE_PERMISSIONS.ASSIGN_WORK_ITEM,
    ROLE_PERMISSIONS.DOCKET_ENTRY,
    ROLE_PERMISSIONS.SERVE_DOCUMENT,
    ROLE_PERMISSIONS.START_PAPER_CASE,
  ],
  docketclerk: [
    ...allInternalUserPermissions,
    ROLE_PERMISSIONS.ASSIGN_WORK_ITEM,
    ROLE_PERMISSIONS.DOCKET_ENTRY,
    ROLE_PERMISSIONS.SERVE_DOCUMENT,
    ROLE_PERMISSIONS.START_PAPER_CASE,
  ],
  judge: [
    ...allInternalUserPermissions,
    ROLE_PERMISSIONS.BATCH_DOWNLOAD_TRIAL_SESSION,
    ROLE_PERMISSIONS.TRIAL_SESSION_WORKING_COPY,
  ],
  petitioner: [
    ROLE_PERMISSIONS.FILE_EXTERNAL_DOCUMENT,
    ROLE_PERMISSIONS.PETITION,
    ROLE_PERMISSIONS.UPDATE_CONTACT_INFO,
    ROLE_PERMISSIONS.UPLOAD_DOCUMENT,
    ROLE_PERMISSIONS.VIEW_DOCUMENTS,
  ],
  petitionsclerk: [
    ...allInternalUserPermissions,
    ROLE_PERMISSIONS.ASSIGN_WORK_ITEM,
    ROLE_PERMISSIONS.SERVE_DOCUMENT,
    ROLE_PERMISSIONS.START_PAPER_CASE,
    ROLE_PERMISSIONS.SEND_TO_IRS_HOLDING_QUEUE,
  ],
  practitioner: [
    ROLE_PERMISSIONS.ASSOCIATE_SELF_WITH_CASE,
    ROLE_PERMISSIONS.FILE_EXTERNAL_DOCUMENT,
    ROLE_PERMISSIONS.GET_CASE,
    ROLE_PERMISSIONS.PETITION,
    ROLE_PERMISSIONS.UPDATE_CONTACT_INFO,
    ROLE_PERMISSIONS.UPLOAD_DOCUMENT,
    ROLE_PERMISSIONS.VIEW_DOCUMENTS,
  ],
  respondent: [
    ROLE_PERMISSIONS.ASSOCIATE_SELF_WITH_CASE,
    ROLE_PERMISSIONS.FILE_EXTERNAL_DOCUMENT,
    ROLE_PERMISSIONS.GET_CASE,
    ROLE_PERMISSIONS.UPDATE_CONTACT_INFO,
    ROLE_PERMISSIONS.UPLOAD_DOCUMENT,
    ROLE_PERMISSIONS.VIEW_DOCUMENTS,
  ],
  trialclerk: allInternalUserPermissions,
};

/**
 * Checks user permissions for an action
 *
 * @param {object} user the user to check for authorization
 * @param {string} action the action to verify if the user is authorized for
 * @param {string} owner the user id of the owner of the item to verify
 * @returns {boolean} true if user is authorized, false otherwise
 */
exports.isAuthorized = (user, action, owner) => {
  if (user.userId && user.userId === owner) {
    return true;
  }

  const userRole = user.role;
  if (!AUTHORIZATION_MAP[userRole]) {
    return false;
  }

  const actionInRoleAuthorization = AUTHORIZATION_MAP[userRole].includes(
    action,
  );
  return actionInRoleAuthorization;
};
