import { docketClerkCreatesATrialSession } from './journey/docketClerkCreatesATrialSession';
import { docketClerkViewsTrialSessionsTab } from './journey/docketClerkViewsTrialSessionsTab';
import { loginAs, setupTest } from './helpers';
import { petitionsClerkSetsATrialSessionsSchedule } from './journey/petitionsClerkSetsATrialSessionsSchedule';
import { petitionsClerkViewsNewTrialSession } from './journey/petitionsClerkViewsNewTrialSession';
import { prepareDateFromString } from '../../shared/src/business/utilities/DateHandler';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../src/withAppContext';

describe('petitions clerk views NOTT reminder on calendared trial session within 30-35 day range', () => {
  const cerebralTest = setupTest();

  const trialLocation = `Seattle, Washington, ${Date.now()}`;

  const currentDate = prepareDateFromString().plus({
    ['days']: 31,
  });

  // trialDate should be 30 days from now
  const overrides = {
    maxCases: 2,
    preferredTrialCity: trialLocation,
    sessionType: 'Small',
    trialDay:
      currentDate.day.toString().length === 1
        ? '0' + currentDate.day
        : currentDate.day,
    trialLocation,
    trialMonth:
      currentDate.month.toString().length === 1
        ? '0' + currentDate.month
        : currentDate.month,
    trialYear: currentDate.year.toString(),
  };

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  describe(`Create trial session with Small session type for '${trialLocation}'`, () => {
    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkCreatesATrialSession(cerebralTest, overrides);
  });

  describe('petitions clerk sets calendar for trial session', () => {
    loginAs(cerebralTest, 'petitionsclerk@example.com');
    petitionsClerkViewsNewTrialSession(cerebralTest);
    petitionsClerkSetsATrialSessionsSchedule(cerebralTest);
  });

  describe('docket clerk views new trial session in trial session list', () => {
    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkViewsTrialSessionsTab(cerebralTest);

    it('should see the NOTT icon on the new trial session', () => {});
  });

  // go back to the main trial session page
  // assert that the trial session is showing the clock (helper?)
  // assert the tooltip?
  // login as docketclerk (non Petitions Clerk, CSS, or CotC)
  // go into the trial session
  // assert that the alert banner is there, but can't clear it
  // login as petitionsClerk
  // go into the trial session
  // assert that the alert banner is there
  // clear the alert
  // assert the banner is success
});
