const {
  migrateItems: migration0001,
} = require('./migrations/0001-remove-has-sealed-documents');
const {
  migrateItems: migration0002,
} = require('./migrations/0002-default-sealed-to');
const {
  migrateItems: migration0003,
} = require('./migrations/0003-update-trial-session-working-copy-status');
const {
  migrateItems: migration0004,
} = require('./migrations/0004-remove-closedDate-for-open-cases');

// MODIFY THIS ARRAY TO ADD NEW MIGRATIONS OR REMOVE OLD ONES
const migrationsToRun = [
  { key: '0001-remove-has-sealed-documents.js', script: migration0001 },
  { key: '0002-default-sealed-to.js', script: migration0002 },
  {
    key: '0003-update-trial-session-working-copy-status.js',
    script: migration0003,
  },
  {
    key: '0004-remove-closedDate-for-open-cases.js',
    script: migration0004,
  },
];

exports.migrationsToRun = migrationsToRun;
