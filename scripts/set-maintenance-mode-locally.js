const {
  sendMaintenanceNotificationsLambda,
} = require('../web-api/src/cases/sendMaintenanceNotificationsLambda');

const maintenanceMode = process.argv[2];

const setMaintenanceModeLocally = async () => {
  await sendMaintenanceNotificationsLambda({
    maintenanceMode,
  });
};

setMaintenanceModeLocally();

exports.setMaintenanceModeLocally = setMaintenanceModeLocally;
