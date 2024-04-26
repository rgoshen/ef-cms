import {
  confirmUser,
  deleteAllCypressTestAccounts,
} from './cypress/helpers/cypressTasks/cognito/cognito-helpers';
import { defineConfig } from 'cypress';
import {
  deleteAllFilesInFolder,
  ensureFolderExists,
} from './cypress/cypress-integration/support/database';
import {
  expireUserConfirmationCode,
  getEmailVerificationToken,
  getNewAccountVerificationCode,
} from './cypress/helpers/cypressTasks/dynamo/dynamo-helpers';
import { unzipFile } from './cypress/helpers/file/unzip-file';
import { waitForNoce } from './cypress/helpers/cypressTasks/wait-for-noce';
import { waitForPractitionerEmailUpdate } from './cypress/helpers/cypressTasks/wait-for-practitioner-email-update';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 60000,
  e2e: {
    baseUrl: 'http://localhost:1234',
    experimentalStudio: true,
    setupNodeEvents(on) {
      on('task', {
        confirmUser({ email }) {
          return confirmUser({ email });
        },
        deleteAllCypressTestAccounts() {
          return deleteAllCypressTestAccounts();
        },
        deleteAllFilesInFolder(dir) {
          return deleteAllFilesInFolder(dir);
        },
        ensureFolderExists(directory) {
          return ensureFolderExists(directory);
        },
        expireUserConfirmationCode(email: string) {
          return expireUserConfirmationCode(email);
        },
        getEmailVerificationToken({ email }) {
          return getEmailVerificationToken({ email });
        },
        getNewAccountVerificationCode({ email }) {
          return getNewAccountVerificationCode({ email });
        },
        unzipFile({ destinationPath, filePath }) {
          return unzipFile({ destinationPath, filePath });
        },
        waitForNoce({ docketNumber }: { docketNumber: string }) {
          return waitForNoce({ docketNumber });
        },
        waitForPractitionerEmailUpdate({
          docketNumber,
          practitionerEmail,
        }: {
          docketNumber: string;
          practitionerEmail: string;
        }) {
          return waitForPractitionerEmailUpdate({
            docketNumber,
            practitionerEmail,
          });
        },
      });
    },
    specPattern: 'cypress/cypress-integration/integration/**/*.cy.ts',
    supportFile: 'cypress/cypress-integration/support/index.ts',
    testIsolation: false,
  },
  fixturesFolder: 'cypress/cypress-integration/fixtures',
  reporter: 'spec',
  reporterOptions: {
    toConsole: true,
  },
  requestTimeout: 60000,
  retries: 0,
  screenshotOnRunFailure: false,
  screenshotsFolder: 'cypress/cypress-integration/screenshots',
  video: true,
  videosFolder: 'cypress/cypress-integration/videos',
  viewportHeight: 900,
  viewportWidth: 1200,
  watchForFileChanges: false,
});
