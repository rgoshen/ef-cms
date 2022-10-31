import {
  AUTOMATIC_BLOCKED_REASONS,
  CASE_STATUS_TYPES,
  CONTACT_TYPES,
  COUNTRY_TYPES,
  COURT_ISSUED_EVENT_CODES,
  DOCKET_SECTION,
  PARTY_TYPES,
  TRIAL_SESSION_PROCEEDING_TYPES,
} from '../../entities/EntityConstants';
import { ENTERED_AND_SERVED_EVENT_CODES } from '../../entities/courtIssuedDocument/CourtIssuedDocumentConstants';
import { MOCK_CASE } from '../../../test/mockCase';
import { MOCK_DOCUMENTS } from '../../../test/mockDocuments';
import {
  applicationContext,
  testPdfDoc,
} from '../../test/createTestApplicationContext';
import { createISODateString } from '../../utilities/DateHandler';
import { docketClerkUser } from '../../../test/mockUsers';
import { serveCourtIssuedDocumentInteractor } from './serveCourtIssuedDocumentInteractor';
import { v4 as uuidv4 } from 'uuid';

describe('serveCourtIssuedDocumentInteractor', () => {
  const mockClientConnectionId = '167e78f8-a11b-4c80-b787-a7a3cf23e25a';
  let extendCase;
  let mockTrialSession;

  const mockDocketEntryId = 'cf105788-5d34-4451-aa8d-dfd9a851b675';
  const mockServedDocketEntryId = '736a68f4-d08d-4ba1-8185-117359f46804';

  const mockPdfUrl = 'www.example.com';

  const mockWorkItem = {
    docketNumber: MOCK_CASE.docketNumber,
    section: DOCKET_SECTION,
    sentBy: docketClerkUser.name,
    sentByUserId: docketClerkUser.userId,
    workItemId: 'b4c7337f-9ca0-45d9-9396-75e003f81e32',
  };

  const docketEntriesWithCaseClosingEventCodes =
    ENTERED_AND_SERVED_EVENT_CODES.map(eventCode => {
      const eventCodeMap = COURT_ISSUED_EVENT_CODES.find(
        entry => entry.eventCode === eventCode,
      );

      return {
        docketEntryId: uuidv4(),
        docketNumber: MOCK_CASE.docketNumber,
        documentType: eventCodeMap.documentType,
        eventCode,
        signedAt: createISODateString(),
        signedByUserId: uuidv4(),
        signedJudgeName: 'Chief Judge',
        userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
        workItem: mockWorkItem,
      };
    });

  const mockCases = [
    {
      ...MOCK_CASE,
      docketEntries: [
        {
          docketEntryId: 'c54ba5a9-b37b-479d-9201-067ec6e335bc',
          docketNumber: MOCK_CASE.docketNumber,
          documentType: 'Order',
          eventCode: 'O',
          serviceStamp: 'Served',
          signedAt: createISODateString(),
          signedByUserId: uuidv4(),
          signedJudgeName: 'Chief Judge',
          userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
          workItem: mockWorkItem,
        },
        {
          docketEntryId: mockDocketEntryId,
          docketNumber: MOCK_CASE.docketNumber,
          documentType: 'Order that case is assigned',
          eventCode: 'OAJ',
          signedAt: createISODateString(),
          signedByUserId: uuidv4(),
          signedJudgeName: 'Chief Judge',
          userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
          workItem: mockWorkItem,
        },
        {
          docketEntryId: mockServedDocketEntryId,
          docketNumber: MOCK_CASE.docketNumber,
          documentType: 'Order that case is assigned',
          eventCode: 'OAJ',
          servedAt: createISODateString(),
          servedParties: [
            {
              name: 'Bernard Lowe',
            },
          ],
          signedAt: createISODateString(),
          signedByUserId: uuidv4(),
          signedJudgeName: 'Chief Judge',
          userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
          workItem: mockWorkItem,
        },
        ...docketEntriesWithCaseClosingEventCodes,
      ],
    },
    {
      ...MOCK_CASE,
      docketEntries: [
        {
          docketEntryId: 'c54ba5a9-b37b-479d-9201-067ec6e335bc',
          docketNumber: '102-20',
          documentType: 'Order',
          eventCode: 'O',
          pending: true,
          serviceStamp: 'Served',
          signedAt: createISODateString(),
          signedByUserId: uuidv4(),
          signedJudgeName: 'Chief Judge',
          userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
          workItem: mockWorkItem,
        },
        {
          docketEntryId: mockDocketEntryId,
          docketNumber: '102-20',
          documentType: 'Order that case is assigned',
          eventCode: 'OAJ',
          signedAt: createISODateString(),
          signedByUserId: uuidv4(),
          signedJudgeName: 'Chief Judge',
          userId: '2474e5c0-f741-4120-befa-b77378ac8bf0',
          workItem: mockWorkItem,
        },
        ...docketEntriesWithCaseClosingEventCodes,
      ],
      docketNumber: '102-20',
      partyType: PARTY_TYPES.petitionerSpouse,
      petitioners: [
        ...MOCK_CASE.petitioners,
        {
          address1: '123 Main St',
          city: 'Somewhere',
          contactType: CONTACT_TYPES.secondary,
          countryType: COUNTRY_TYPES.DOMESTIC,
          name: 'Contact Secondary',
          phone: '123123134',
          postalCode: '12345',
          state: 'TN',
        },
      ],
    },
  ];

  beforeAll(() => {
    applicationContext
      .getPersistenceGateway()
      .saveDocumentFromLambda.mockImplementation(() => {});

    applicationContext.logger.error.mockImplementation(() => {});

    applicationContext
      .getUseCaseHelpers()
      .countPagesInDocument.mockResolvedValue(1);

    applicationContext.getStorageClient().getObject.mockReturnValue({
      promise: () => ({
        Body: testPdfDoc,
      }),
    });

    applicationContext
      .getPersistenceGateway()
      .putWorkItemInUsersOutbox.mockImplementation(() => {});

    applicationContext
      .getPersistenceGateway()
      .saveWorkItem.mockImplementation(() => {});

    applicationContext
      .getUseCaseHelpers()
      .serveDocumentAndGetPaperServicePdf.mockReturnValue({
        pdfUrl: mockPdfUrl,
      });
  });

  beforeEach(() => {
    extendCase = {};

    applicationContext
      .getPersistenceGateway()
      .getUserById.mockReturnValue(docketClerkUser);

    applicationContext.getCurrentUser.mockReturnValue(docketClerkUser);

    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockImplementation(({ docketNumber }) => {
        const theCase = mockCases.find(
          mockCase => mockCase.docketNumber === docketNumber,
        );
        if (theCase) {
          return {
            ...theCase,
            ...extendCase,
          };
        } else return {};
      });

    mockTrialSession = {
      caseOrder: [
        {
          docketNumber: mockCases[0].docketNumber,
        },
      ],
      createdAt: '2019-10-27T05:00:00.000Z',
      gsi1pk: 'trial-session-catalog',
      isCalendared: true,
      judge: {
        name: 'Judge Colvin',
        userId: 'dabbad00-18d0-43ec-bafb-654e83405416',
      },
      maxCases: 100,
      pk: 'trial-session|959c4338-0fac-42eb-b0eb-d53b8d0195cc',
      proceedingType: TRIAL_SESSION_PROCEEDING_TYPES.inPerson,
      sessionType: 'Regular',
      sk: 'trial-session|959c4338-0fac-42eb-b0eb-d53b8d0195cc',
      startDate: '2019-11-27T05:00:00.000Z',
      startTime: '10:00',
      swingSession: true,
      swingSessionId: '208a959f-9526-4db5-b262-e58c476a4604',
      term: 'Fall',
      termYear: '2019',
      trialLocation: 'Houston, Texas',
      trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
    };

    applicationContext
      .getPersistenceGateway()
      .getTrialSessionById.mockReturnValue(mockTrialSession);
  });

  it('should throw an error when the user role does not have the SERVE_DOCUMENT permission', async () => {
    applicationContext.getCurrentUser.mockReturnValue({});

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: mockClientConnectionId,
        docketEntryId: '',
        docketNumbers: [],
        subjectCaseDocketNumber: '',
      }),
    ).rejects.toThrow('Unauthorized');
  });

  it('should throw an error when the case can not be found', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({});

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: mockClientConnectionId,
        docketEntryId: '',
        docketNumbers: [],
        subjectCaseDocketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow(`Case ${MOCK_CASE.docketNumber} was not found`);
  });

  it('should throw an error when the docketEntry was not found on the case', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({
        docketEntries: [],
        docketNumber: MOCK_CASE.docketNumber,
      });

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: mockClientConnectionId,
        docketEntryId: mockDocketEntryId,
        docketNumbers: [],
        subjectCaseDocketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow(`Docket entry ${mockDocketEntryId} was not found`);
  });

  it('should throw an error when the docket entry has already been served', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({
        docketEntries: [
          {
            docketEntryId: mockServedDocketEntryId,
            servedAt: '2018-03-01T05:00:00.000Z',
          },
        ],
        docketNumber: MOCK_CASE.docketNumber,
      });

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: '',
        docketEntryId: mockServedDocketEntryId,
        docketNumbers: [],
        subjectCaseDocketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow('Docket entry has already been served');
  });

  it('should throw an error if the document is already pending service', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({
        docketEntries: [
          {
            docketEntryId: mockDocketEntryId,
            isPendingService: true,
          },
        ],
        docketNumber: MOCK_CASE.docketNumber,
      });

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: '',
        docketEntryId: mockDocketEntryId,
        docketNumbers: [],
        subjectCaseDocketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow('Docket entry is already being served');

    expect(
      applicationContext.getUseCaseHelpers().serveDocumentAndGetPaperServicePdf,
    ).not.toHaveBeenCalled();
  });

  it.skip('should update the case and work items', async () => {
    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: 'testing',
      docketEntryId: 'c54ba5a9-b37b-479d-9201-067ec6e335bc',
      docketNumbers: [mockCases[0].docketNumber],
      subjectCaseDocketNumber: mockCases[0].docketNumber,
    });

    const updatedCase =
      applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0]
        .caseToUpdate;
    const updatedDocument = updatedCase.docketEntries.find(
      docketEntry =>
        docketEntry.docketEntryId === 'c54ba5a9-b37b-479d-9201-067ec6e335bc',
    );

    expect(updatedDocument.servedAt).toBeDefined();
    expect(updatedDocument.filingDate).toBeDefined();
    expect(updatedDocument.leadDocketNumber).not.toBeDefined();
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().saveWorkItem,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().putWorkItemInUsersOutbox,
    ).toHaveBeenCalled();
  });

  it.skip('should set the document as served and update the case and work items for a non-generic order document', async () => {
    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: 'testing',
      docketEntryId: mockDocketEntryId,
      docketNumbers: [mockCases[0].docketNumber],
      subjectCaseDocketNumber: mockCases[0].docketNumber,
    });

    const updatedCase =
      applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0]
        .caseToUpdate;
    const updatedDocument = updatedCase.docketEntries.find(
      docketEntry => docketEntry.docketEntryId === mockDocketEntryId,
    );

    expect(updatedDocument.servedAt).toBeDefined();
    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().saveWorkItem,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().putWorkItemInUsersOutbox,
    ).toHaveBeenCalled();
  });

  it('should mark the case as automaticBlocked when the docket entry being served is pending', async () => {
    const mockDocketEntryPending = {
      ...MOCK_DOCUMENTS[0],
      docketEntryId: mockDocketEntryId,
      pending: true,
    };
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({
        ...MOCK_CASE,
        docketEntries: [mockDocketEntryPending],
      });

    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: '',
      docketEntryId: mockDocketEntryId,
      docketNumbers: [],
      subjectCaseDocketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getUseCaseHelpers().updateCaseAutomaticBlock,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0]
        .caseToUpdate,
    ).toMatchObject({
      automaticBlocked: true,
      automaticBlockedDate: expect.anything(),
      automaticBlockedReason: AUTOMATIC_BLOCKED_REASONS.pending,
    });
  });

  it('should remove the case from the trial session if the case has a trialSessionId and trialSession is calendared', async () => {
    extendCase.trialSessionId = 'c54ba5a9-b37b-479d-9201-067ec6e335bb';
    extendCase.trialDate = '2019-11-27T05:00:00.000Z';

    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: '',
      docketEntryId: docketEntriesWithCaseClosingEventCodes[0].docketEntryId,
      docketNumbers: [mockCases[0].docketNumber],
      subjectCaseDocketNumber: mockCases[0].docketNumber,
    });

    expect(
      applicationContext.getUseCaseHelpers().serveDocumentAndGetPaperServicePdf,
    ).toHaveBeenCalled();
    const updatedTrialSession =
      applicationContext.getPersistenceGateway().updateTrialSession.mock
        .calls[0][0].trialSessionToUpdate;
    expect(updatedTrialSession.caseOrder[0].disposition).toEqual(
      'Status was changed to Closed',
    );
  });

  it('should delete the case from the trial session if the case has a trialSessionId and trialSession is not calendared', async () => {
    mockTrialSession.isCalendared = false;

    extendCase.trialSessionId = 'c54ba5a9-b37b-479d-9201-067ec6e335bb';
    extendCase.trialDate = '2019-11-27T05:00:00.000Z';

    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: 'testing',
      docketEntryId: docketEntriesWithCaseClosingEventCodes[0].docketEntryId,
      docketNumbers: [mockCases[0].docketNumber],
      subjectCaseDocketNumber: mockCases[0].docketNumber,
    });

    expect(
      applicationContext.getUseCaseHelpers().serveDocumentAndGetPaperServicePdf,
    ).toHaveBeenCalled();
    const updatedTrialSession =
      applicationContext.getPersistenceGateway().updateTrialSession.mock
        .calls[0][0].trialSessionToUpdate;
    expect(updatedTrialSession.caseOrder.length).toEqual(0);
  });

  docketEntriesWithCaseClosingEventCodes.forEach(docketEntry => {
    it(`should set the case status to closed for event code: ${docketEntry.eventCode}`, async () => {
      await serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: 'testing',
        docketEntryId: docketEntry.docketEntryId,
        docketNumbers: [mockCases[0].docketNumber],
        subjectCaseDocketNumber: mockCases[0].docketNumber,
      });

      const updatedCase =
        applicationContext.getPersistenceGateway().updateCase.mock.calls[0][0]
          .caseToUpdate;

      expect(updatedCase.status).toEqual(CASE_STATUS_TYPES.closed);
      expect(
        applicationContext.getPersistenceGateway()
          .deleteCaseTrialSortMappingRecords,
      ).toHaveBeenCalled();
    });
  });

  it('should mark the docketEntry as pending service while processing is ongoing and unset pending when processing has completed', async () => {
    await serveCourtIssuedDocumentInteractor(applicationContext, {
      clientConnectionId: '',
      docketEntryId: mockDocketEntryId,
      docketNumbers: [],
      subjectCaseDocketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus,
    ).toHaveBeenCalledWith({
      applicationContext,
      docketEntryId: mockDocketEntryId,
      docketNumber: MOCK_CASE.docketNumber,
      status: true,
    });
    expect(
      applicationContext.getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus,
    ).toHaveBeenCalledWith({
      applicationContext,
      docketEntryId: mockDocketEntryId,
      docketNumber: MOCK_CASE.docketNumber,
      status: false,
    });
  });

  it('should call the persistence method to unset the pending service status on the document if there is an error when serving', async () => {
    const docketEntry = mockCases[0].docketEntries[0];
    docketEntry.isPendingService = false;

    applicationContext
      .getUseCaseHelpers()
      .serveDocumentAndGetPaperServicePdf.mockRejectedValueOnce(
        new Error('whoops, that is an error!'),
      );

    await expect(
      serveCourtIssuedDocumentInteractor(applicationContext, {
        clientConnectionId: 'testing',
        docketEntryId: docketEntry.docketEntryId,
        docketNumbers: [mockCases[0].docketNumber],
        subjectCaseDocketNumber: mockCases[0].docketNumber,
      }),
    ).rejects.toThrow('whoops, that is an error!');

    expect(
      applicationContext.getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus,
    ).toHaveBeenCalledWith({
      applicationContext,
      docketEntryId: docketEntry.docketEntryId,
      docketNumber: mockCases[0].docketNumber,
      status: true,
    });

    expect(
      applicationContext.getPersistenceGateway()
        .updateDocketEntryPendingServiceStatus,
    ).toHaveBeenCalledWith({
      applicationContext,
      docketEntryId: docketEntry.docketEntryId,
      docketNumber: mockCases[0].docketNumber,
      status: false,
    });
  });
});
