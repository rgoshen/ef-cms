export default (test, expectedCount) => {
  return it('Petitions Clerk Views A Trial Sessions Eligible Cases', async () => {
    await test.runSequence('gotoTrialSessionDetailSequence', {
      trialSessionId: test.trialSessionId,
    });

    expect(test.getState('trialSession.eligibleCases').length).toEqual(
      expectedCount,
    );
    expect(test.getState('trialSession.status')).toEqual('Upcoming');
    expect(test.getState('trialSession.isCalendared')).toEqual(false);
  });
};
