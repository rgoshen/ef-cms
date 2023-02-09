const {
  approvePendingJob,
} = require('../../../../shared/admin-tools/circleci/approve-pending-job');
const {
  isReindexComplete,
} = require('../../../../shared/admin-tools/elasticsearch/check-reindex-complete');

exports.handler = async () => {
  const migrateFlag = process.env.MIGRATE_FLAG;

  if (migrateFlag === 'true') {
    console.log(`Migrate flag is ${migrateFlag}`);
    const environmentName = process.env.ENVIRONMENT;
    const isReindexFinished = await isReindexComplete(environmentName);

    if (!isReindexFinished) {
      console.log('Reindex is not complete');
      return;
    }
  }

  console.log('Approving CircleCI wait for reindex job');

  const apiToken = process.env.CIRCLE_MACHINE_USER_TOKEN;
  const workflowId = process.env.CIRCLE_WORKFLOW_ID;

  await approvePendingJob({ apiToken, workflowId });
};
