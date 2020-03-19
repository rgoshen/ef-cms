export default test => {
  it('practitioner sees the procedure types and case types', async () => {
    await test.runSequence('gotoStartCaseWizardSequence');
    const procedureTypes = test.getState('procedureTypes');
    expect(procedureTypes).not.toBeNull;
    expect(procedureTypes.length).toBeGreaterThan(0);
  });
};
