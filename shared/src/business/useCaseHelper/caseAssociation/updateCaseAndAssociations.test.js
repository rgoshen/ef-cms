const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  TRIAL_SESSION_PROCEEDING_TYPES,
} = require('../../entities/EntityConstants');
const { Case } = require('../../entities/cases/Case');
const { MOCK_CASE } = require('../../../../src/test/mockCase');
const { MOCK_DOCUMENTS } = require('../../../test/mockDocuments');
const { updateCaseAndAssociations } = require('./updateCaseAndAssociations');

describe('updateCaseAndAssociations', () => {
  const MOCK_TRIAL_SESSION = {
    address1: '123 Street Lane',
    caseOrder: [
      { docketNumber: MOCK_CASE.docketNumber },
      { docketNumber: '123-45' },
    ],
    city: 'Scottsburg',
    judge: {
      name: 'A Judge',
      userId: '55f4fc65-b33e-4c04-8561-3e56d533f386',
    },
    maxCases: 100,
    postalCode: '47130',
    proceedingType: TRIAL_SESSION_PROCEEDING_TYPES.inPerson,
    sessionType: 'Regular',
    startDate: '3000-03-01T00:00:00.000Z',
    state: 'IN',
    term: 'Fall',
    termYear: '3000',
    trialLocation: 'Birmingham, Alabama',
    trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
  };

  let updateCaseMock = jest.fn();
  let validMockCase;

  beforeAll(() => {
    validMockCase = new Case(
      {
        ...MOCK_CASE,
        archivedCorrespondences: [
          {
            correspondenceId: applicationContext.getUniqueId(),
            documentTitle: 'Inverted Yield Curve',
            userId: applicationContext.getUniqueId(),
          },
        ],
        correspondence: [
          {
            correspondenceId: applicationContext.getUniqueId(),
            documentTitle: 'Deflationary Spending',
            userId: applicationContext.getUniqueId(),
          },
        ],
      },
      { applicationContext },
    )
      .validate()
      .toRawObject();
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue(validMockCase);

    applicationContext
      .getPersistenceGateway()
      .updateCase.mockImplementation(updateCaseMock);
  });

  it('gets the old case before passing it to updateCase persistence method', async () => {
    const caseToUpdate = {
      ...validMockCase,
    };
    const oldCase = {
      ...validMockCase,
    };
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue(oldCase);

    await updateCaseAndAssociations({
      applicationContext,
      caseToUpdate,
    });

    expect(
      applicationContext.getPersistenceGateway().getCaseByDocketNumber,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();

    expect(
      applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0],
    ).toMatchObject({ applicationContext, caseToUpdate, oldCase });
  });

  it('always sends valid entities to the updateCase persistence method', async () => {
    await updateCaseAndAssociations({
      applicationContext,
      caseToUpdate: validMockCase,
    });
    expect(
      applicationContext.getPersistenceGateway().getCaseByDocketNumber,
    ).toHaveBeenCalled();
    expect(updateCaseMock).toHaveBeenCalled();
    const updateArgs = updateCaseMock.mock.calls[0][0];

    expect(updateArgs.caseToUpdate.isValidated).toBe(true);
    expect(updateArgs.oldCase.isValidated).toBe(true);
  });

  it('updates hearings, removing old ones from the given case', async () => {
    const trialSessionIds = [
      applicationContext.getUniqueId(),
      applicationContext.getUniqueId(),
      applicationContext.getUniqueId(),
    ];

    const { docketNumber } = validMockCase;
    const caseToUpdate = {
      ...validMockCase,
      docketNumber,
      hearings: [{ ...MOCK_TRIAL_SESSION, trialSessionId: trialSessionIds[0] }],
    };
    const oldCase = {
      ...validMockCase,
      docketNumber,
      hearings: [
        { ...MOCK_TRIAL_SESSION, trialSessionId: trialSessionIds[0] },
        { ...MOCK_TRIAL_SESSION, trialSessionId: trialSessionIds[1] },
        { ...MOCK_TRIAL_SESSION, trialSessionId: trialSessionIds[2] },
      ],
    };

    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue(oldCase);

    await updateCaseAndAssociations({
      applicationContext,
      caseToUpdate,
    });

    expect(
      applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0],
    ).toMatchObject({ applicationContext, caseToUpdate, oldCase });
    expect(
      applicationContext.getPersistenceGateway().removeCaseFromHearing,
    ).toHaveBeenCalledTimes(2);
    expect(
      applicationContext.getPersistenceGateway().removeCaseFromHearing.mock
        .calls,
    ).toMatchObject([
      [{ docketNumber, trialSessionId: trialSessionIds[1] }],
      [{ docketNumber, trialSessionId: trialSessionIds[2] }],
    ]);
  });

  describe('documents', () => {
    it('does not call updateDocketEntry if all docket entries are unchanged', async () => {
      const oldCase = {
        ...validMockCase,
        archivedDocketEntries: MOCK_DOCUMENTS,
        docketEntries: MOCK_DOCUMENTS,
      };
      const caseToUpdate = {
        ...oldCase,
        archivedDocketEntries: MOCK_DOCUMENTS,
        docketEntries: MOCK_DOCUMENTS,
      };

      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValue(caseToUpdate);

      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate,
      });

      expect(
        applicationContext.getPersistenceGateway().updateDocketEntry,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0],
      ).toMatchObject({ applicationContext, caseToUpdate, oldCase });
    });

    it('calls updateDocketEntry for each case document which has been added or changed', async () => {
      const oldCase = {
        ...MOCK_CASE,
        archivedDocketEntries: [MOCK_DOCUMENTS[0]],
        docketEntries: [MOCK_DOCUMENTS[0]],
      };

      const caseToUpdate = {
        ...oldCase,
        archivedDocketEntries: [
          { ...MOCK_DOCUMENTS[0], documentTitle: 'Updated Archived Entry' },
          { ...MOCK_DOCUMENTS[1], documentTitle: 'New Archived Entry' },
        ],
        docketEntries: [
          { ...MOCK_DOCUMENTS[0], documentTitle: 'Updated Docket Entry' },
          { ...MOCK_DOCUMENTS[1], documentTitle: 'New Docket Entry' },
        ],
      };

      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValue(oldCase);

      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate,
      });

      expect(
        applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0],
      ).toMatchObject({ applicationContext, caseToUpdate, oldCase });

      expect(
        applicationContext.getPersistenceGateway().updateDocketEntry,
      ).toHaveBeenCalledTimes(4);
    });
  });

  describe('correspondences', () => {
    it('does not call updateCaseCorrespondence if all docket entries are unchanged', async () => {
      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValue(validMockCase);
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: validMockCase,
      });
      expect(
        applicationContext.getPersistenceGateway().updateCaseCorrespondence,
      ).not.toHaveBeenCalled();
    });

    it('calls updateCaseCorrespondence for each case document which has been added or changed', async () => {
      const caseToUpdate = {
        ...validMockCase,
        archivedCorrespondences: [
          {
            ...validMockCase.archivedCorrespondences[0],
            documentTitle: 'Updated Archived Correspondence',
          },
          {
            correspondenceId: applicationContext.getUniqueId(),
            documentTitle: 'New Archived Correspondence',
            userId: applicationContext.getUniqueId(),
          },
        ],
        correspondence: [
          {
            ...validMockCase.correspondence[0],
            documentTitle: 'Updated Correspondence',
          },
          {
            correspondenceId: applicationContext.getUniqueId(),
            documentTitle: 'New Correspondence',
            userId: applicationContext.getUniqueId(),
          },
        ],
      };

      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate,
      });

      expect(
        applicationContext.getPersistenceGateway().updateCaseCorrespondence,
      ).toHaveBeenCalledTimes(4);
    });
  });

  describe('IRS practitioners', () => {
    const practitionerId = applicationContext.getUniqueId();
    const mockCaseWithIrsPractitioners = new Case(
      {
        ...MOCK_CASE,
        irsPractitioners: [
          {
            barNumber: 'BT007',
            name: 'Bobby Tables',
            role: 'irsPractitioner',
            userId: practitionerId,
          },
        ],
      },
      { applicationContext },
    );

    beforeAll(() => {
      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValue(mockCaseWithIrsPractitioners);
    });

    it('does not call updateIrsPractitionerOnCase or removeIrsPractitionerOnCase if all IRS practitioners are unchanged', async () => {
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: mockCaseWithIrsPractitioners,
      });
      expect(
        applicationContext.getPersistenceGateway().updateIrsPractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().removeIrsPractitionerOnCase,
      ).not.toHaveBeenCalled();
    });

    it('calls updateIrsPractitionerOnCase on changed entries in irsPractitioners', async () => {
      const updatedPractitioner = {
        barNumber: 'BT007',
        name: 'Robert Jables', // changed name
        role: 'irsPractitioner',
        userId: practitionerId,
      };
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: {
          ...mockCaseWithIrsPractitioners,
          irsPractitioners: [updatedPractitioner],
        },
      });

      expect(
        applicationContext.getPersistenceGateway().removeIrsPractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().updateIrsPractitionerOnCase,
      ).toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().updateIrsPractitionerOnCase
          .mock.calls[0][0],
      ).toMatchObject({
        docketNumber: validMockCase.docketNumber,
        practitioner: updatedPractitioner,
        userId: practitionerId,
      });
    });

    it('removes an irsPractitioner from a case with existing irsPractitioners', async () => {
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: {
          ...mockCaseWithIrsPractitioners,
          irsPractitioners: [],
        },
      });

      expect(
        applicationContext.getPersistenceGateway().updateIrsPractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().removeIrsPractitionerOnCase,
      ).toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway().removeIrsPractitionerOnCase
          .mock.calls[0][0],
      ).toMatchObject({
        docketNumber: validMockCase.docketNumber,
        userId: practitionerId,
      });
    });
  });

  describe('Private practitioners', () => {
    const practitionerId = applicationContext.getUniqueId();
    const mockCaseWithIrsPractitioners = new Case(
      {
        ...MOCK_CASE,
        privatePractitioners: [
          {
            barNumber: 'BT007',
            name: 'Billie Jean',
            role: 'privatePractitioner',
            userId: practitionerId,
          },
        ],
      },
      { applicationContext },
    );

    beforeAll(() => {
      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValue(mockCaseWithIrsPractitioners);
    });

    it('does not call updatePrivatePractitionerOnCase or removePrivatePractitionerOnCase if all private practitioners are unchanged', async () => {
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: mockCaseWithIrsPractitioners,
      });
      expect(
        applicationContext.getPersistenceGateway()
          .updatePrivatePractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway()
          .removePrivatePractitionerOnCase,
      ).not.toHaveBeenCalled();
    });

    it('calls updatePrivatePractitionerOnCase on changed entries in privatePractitioners', async () => {
      const updatedPractitioner = {
        barNumber: 'BT007',
        name: 'William Denim', // changed name
        role: 'privatePractitioner',
        userId: practitionerId,
      };
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: {
          ...mockCaseWithIrsPractitioners,
          privatePractitioners: [updatedPractitioner],
        },
      });

      expect(
        applicationContext.getPersistenceGateway()
          .removePrivatePractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway()
          .updatePrivatePractitionerOnCase,
      ).toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway()
          .updatePrivatePractitionerOnCase.mock.calls[0][0],
      ).toMatchObject({
        docketNumber: validMockCase.docketNumber,
        practitioner: updatedPractitioner,
        userId: practitionerId,
      });
    });

    it('removes an privatePractitioner from a case with existing privatePractitioners', async () => {
      await updateCaseAndAssociations({
        applicationContext,
        caseToUpdate: {
          ...mockCaseWithIrsPractitioners,
          privatePractitioners: [],
        },
      });

      expect(
        applicationContext.getPersistenceGateway()
          .updatePrivatePractitionerOnCase,
      ).not.toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway()
          .removePrivatePractitionerOnCase,
      ).toHaveBeenCalled();
      expect(
        applicationContext.getPersistenceGateway()
          .removePrivatePractitionerOnCase.mock.calls[0][0],
      ).toMatchObject({
        docketNumber: validMockCase.docketNumber,
        userId: practitionerId,
      });
    });
  });
});
