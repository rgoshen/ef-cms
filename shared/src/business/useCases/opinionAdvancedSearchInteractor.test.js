const {
  DATE_RANGE_SEARCH_OPTIONS,
  MAX_SEARCH_RESULTS,
  OPINION_EVENT_CODES_WITH_BENCH_OPINION,
  ROLES,
} = require('../../business/entities/EntityConstants');
const {
  opinionAdvancedSearchInteractor,
} = require('./opinionAdvancedSearchInteractor');
const { applicationContext } = require('../test/createTestApplicationContext');

describe('opinionAdvancedSearchInteractor', () => {
  beforeEach(() => {
    applicationContext.getCurrentUser.mockReturnValue({
      role: ROLES.petitionsClerk,
    });

    applicationContext
      .getPersistenceGateway()
      .advancedDocumentSearch.mockResolvedValue({
        results: [
          {
            caseCaption: 'Samson Workman, Petitioner',
            docketEntryId: 'c5bee7c0-bd98-4504-890b-b00eb398e547',
            docketNumber: '103-19',
            documentTitle: 'T.C. Opinion for More Candy',
            documentType: 'T.C. Opinion',
            eventCode: 'TCOP',
            signedJudgeName: 'Guy Fieri',
          },
          {
            caseCaption: 'Samson Workman, Petitioner',
            docketEntryId: 'c5bee7c0-bd98-4504-890b-b00eb398e547',
            docketNumber: '103-19',
            documentTitle: 'Summary Opinion for KitKats',
            documentType: 'Summary Opinion',
            eventCode: 'SOP',
            signedJudgeName: 'Guy Fieri',
          },
        ],
      });
  });

  it('should return an unauthorized error when the currentUser is a petitioner', async () => {
    applicationContext.getCurrentUser.mockReturnValue({
      role: ROLES.petitioner,
    });

    await expect(
      opinionAdvancedSearchInteractor(applicationContext, {}),
    ).rejects.toThrow('Unauthorized');
  });

  it('should return results when the current user has permission to perform advanced opinion searches (petitionsclerk)', async () => {
    const result = await opinionAdvancedSearchInteractor(applicationContext, {
      dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
      keyword: 'candy',
      startDate: '01/01/2001',
    });

    expect(result).toMatchObject([
      {
        caseCaption: 'Samson Workman, Petitioner',
        docketEntryId: 'c5bee7c0-bd98-4504-890b-b00eb398e547',
        docketNumber: '103-19',
        documentTitle: 'T.C. Opinion for More Candy',
        documentType: 'T.C. Opinion',
        eventCode: 'TCOP',
        signedJudgeName: 'Guy Fieri',
      },
      {
        caseCaption: 'Samson Workman, Petitioner',
        docketEntryId: 'c5bee7c0-bd98-4504-890b-b00eb398e547',
        docketNumber: '103-19',
        documentTitle: 'Summary Opinion for KitKats',
        documentType: 'Summary Opinion',
        eventCode: 'SOP',
        signedJudgeName: 'Guy Fieri',
      },
    ]);
  });

  it('should return no more than MAX_SEARCH_RESULTS', async () => {
    const maxPlusOneResults = new Array(MAX_SEARCH_RESULTS + 1).fill({
      caseCaption: 'Samson Workman, Petitioner',
      docketEntryId: 'c5bee7c0-bd98-4504-890b-b00eb398e547',
      docketNumber: '103-19',
      documentTitle: 'T.C. Opinion for More Candy',
      documentType: 'T.C. Opinion',
      eventCode: 'TCOP',
      signedJudgeName: 'Guy Fieri',
    });
    applicationContext
      .getPersistenceGateway()
      .advancedDocumentSearch.mockResolvedValue({ results: maxPlusOneResults });

    const results = await opinionAdvancedSearchInteractor(applicationContext, {
      keyword: 'keyword',
      petitionerName: 'test person',
    });

    expect(results.length).toBe(MAX_SEARCH_RESULTS);
  });

  it('should search for documents that are of type opinions', async () => {
    const keyword = 'keyword';

    await opinionAdvancedSearchInteractor(applicationContext, {
      dateRange: DATE_RANGE_SEARCH_OPTIONS.CUSTOM_DATES,
      keyword,
      opinionTypes: OPINION_EVENT_CODES_WITH_BENCH_OPINION,
      startDate: '01/01/2001',
    });

    expect(
      applicationContext.getPersistenceGateway().advancedDocumentSearch.mock
        .calls[0][0],
    ).toMatchObject({
      documentEventCodes: OPINION_EVENT_CODES_WITH_BENCH_OPINION,
    });
  });

  it('should search for opinions with isOpinionSearch set to true', async () => {
    await opinionAdvancedSearchInteractor(applicationContext, {});

    expect(
      applicationContext.getPersistenceGateway().advancedDocumentSearch.mock
        .calls[0][0],
    ).toMatchObject({
      isOpinionSearch: true,
    });
  });
});
