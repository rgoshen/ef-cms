const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const { TrialSession } = require('./TrialSession');
const { VALID_TRIAL_SESSION } = require('./TrialSession.test');

describe('TrialSession entity', () => {
  describe('thirtyDaysBeforeTrialFormatted', () => {
    // this is how the court was calculating the duration days between dates
    // https://www.timeanddate.com/date/durationresult.html?m1=5&d1=17&y1=2023&m2=6&d2=15&y2=2023&ti=on
    it("should set thirtyDaysBeforeTrialFormatted to 30 days prior to the trial's startDate, inclusive of the startDate, when the trial session is calendared", () => {
      const trialSession = new TrialSession(
        {
          ...VALID_TRIAL_SESSION,
          isCalendared: true,
          startDate: '2023-06-15',
        },
        {
          applicationContext,
        },
      );

      expect(trialSession.thirtyDaysBeforeTrialFormatted).toBe('05/17/23');
    });
  });
});
