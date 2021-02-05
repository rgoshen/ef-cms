import { ADVANCED_SEARCH_TABS } from '../../shared/src/business/entities/EntityConstants';
import { MOCK_CASE } from '../../shared/src/test/mockCase.js';
import { applicationContextForClient as applicationContext } from '../../shared/src/business/test/createTestApplicationContext';
import { documentViewerHelper as documentViewerHelperComputed } from '../src/presenter/computeds/documentViewerHelper';
import { formattedCaseDetail as formattedCaseDetailComputed } from '../src/presenter/computeds/formattedCaseDetail';
import { loginAs, refreshElasticsearchIndex, setupTest } from './helpers';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../src/withAppContext';
import axios from 'axios';

const formattedCaseDetail = withAppContextDecorator(
  formattedCaseDetailComputed,
);
const documentViewerHelper = withAppContextDecorator(
  documentViewerHelperComputed,
);

const test = setupTest();

const axiosInstance = axios.create({
  headers: {
    Authorization:
      // mocked admin user
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluIiwibmFtZSI6IlRlc3QgQWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOiI4NmMzZjg3Yi0zNTBiLTQ3N2QtOTJjMy00M2JkMDk1Y2IwMDYiLCJjdXN0b206cm9sZSI6ImFkbWluIiwic3ViIjoiODZjM2Y4N2ItMzUwYi00NzdkLTkyYzMtNDNiZDA5NWNiMDA2IiwiaWF0IjoxNTgyOTIxMTI1fQ.PBmSyb6_E_53FNG0GiEpAFqTNmooSh4rI0ApUQt3UH8',
    'Content-Type': 'application/json',
  },
  timeout: 2000,
});

const {
  CHIEF_JUDGE,
  COUNTRY_TYPES,
  SERVICE_INDICATOR_TYPES,
  STATUS_TYPES,
} = applicationContext.getConstants();

const firstConsolidatedCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The First Migrated Case',
  docketNumber: '101-21',
  leadDocketNumber: '101-21',
  preferredTrialCity: 'Washington, District of Columbia',
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};
const secondConsolidatedCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Second Migrated Case',
  docketNumber: '102-21',
  leadDocketNumber: '101-21',
  preferredTrialCity: 'Washington, District of Columbia',
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};

const correspondenceCaseOriginalPetitionerName = `Original ${Date.now()}`;
const correspondenceCaseUpdatedPetitionerName = `Updated ${Date.now()}`;

const correspondenceCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Third Migrated Case',
  contactPrimary: {
    ...MOCK_CASE.contactPrimary,
    name: correspondenceCaseOriginalPetitionerName,
  },
  correspondence: [
    {
      correspondenceId: '148c2f6f-0e9e-42f3-a73b-b250923d72d9',
      documentTitle: 'Receipt',
      filingDate: '2014-01-14T09:53:55.513-05:00',
      userId: '337d6ccc-0f5f-447d-a688-a925da37f252',
    },
  ],
  docketNumber: '106-15',
  preferredTrialCity: 'Washington, District of Columbia',
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};

const otherFilersCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Fourth Migrated Case',
  docketNumber: '187-20',
  otherFilers: [
    {
      address1: '42 Lamb Sauce Blvd',
      city: 'Nashville',
      contactId: '46f9ecf7-53d4-43d0-b4ac-8dd340faa219',
      country: 'USA',
      countryType: COUNTRY_TYPES.DOMESTIC,
      email: 'gordon@thelambsauce.com',
      name: 'Gordon Ramsay',
      otherFilerType: 'Intervenor',
      phone: '1234567890',
      postalCode: '05198',
      state: 'AK',
      title: 'Intervenor',
    },
    {
      address1: '1337 12th Ave',
      city: 'Flavortown',
      contactId: '023c3342-4185-4203-8872-9ad792ec0789',
      country: 'USA',
      countryType: COUNTRY_TYPES.DOMESTIC,
      email: 'mayor@flavortown.com',
      name: 'Guy Fieri',
      otherFilerType: 'Tax Matters Partner',
      phone: '1234567890',
      postalCode: '05198',
      state: 'AK',
      title: 'Tax Matters Partner',
    },
  ],
  preferredTrialCity: 'Tulsa, Oklahoma', // legacy city
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};

const otherPetitionersCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Fifth Migrated Case',
  docketNumber: '16222-20',
  irsPractitioners: [
    {
      barNumber: 'RT6789',
      contact: {
        address1: '982 Oak Boulevard',
        address2: 'Maxime dolorum quae ',
        address3: 'Ut numquam ducimus ',
        city: 'Placeat sed dolorum',
        countryType: COUNTRY_TYPES.DOMESTIC,
        phone: '+1 (785) 771-2329',
        postalCode: '17860',
        state: 'LA',
      },
      email: 'someone@example.com',
      hasEAccess: true,
      name: 'Keelie Bruce',
      role: 'irsPractitioner',
      secondaryName: 'Logan Fields',
      serviceIndicator: SERVICE_INDICATOR_TYPES.SI_NONE,
    },
  ],
  otherPetitioners: [
    {
      additionalName: 'Test Other Petitioner',
      address1: '982 Oak Boulevard',
      address2: 'Maxime dolorum quae ',
      address3: 'Ut numquam ducimus ',
      city: 'Placeat sed dolorum',
      contactId: 'dd0ac156-aa2d-46e7-8b5a-902f1d16f199',
      countryType: COUNTRY_TYPES.DOMESTIC,
      name: 'Keelie Bruce',
      phone: '+1 (785) 771-2329',
      postalCode: '17860',
      secondaryName: 'Logan Fields',
      serviceIndicator: SERVICE_INDICATOR_TYPES.SI_NONE,
      state: 'LA',
    },
  ],
  preferredTrialCity: 'Washington, District of Columbia',
  privatePractitioners: [
    {
      barNumber: 'PT1234',
      contact: {
        address1: '982 Oak Boulevard',
        address2: 'Maxime dolorum quae ',
        address3: 'Ut numquam ducimus ',
        barNumber: 'PT1234',
        city: 'Placeat sed dolorum',
        countryType: COUNTRY_TYPES.DOMESTIC,
        phone: '+1 (785) 771-2329',
        postalCode: '17860',
        state: 'LA',
      },
      email: 'someone@example.com',
      hasEAccess: true,
      name: 'Keelie Bruce',
      representing: [
        'dd0ac156-aa2d-46e7-8b5a-902f1d16f199',
        '7805d1ab-18d0-43ec-bafb-654e83405416',
      ],
      role: 'privatePractitioner',
      secondaryName: 'Logan Fields',
      serviceIndicator: SERVICE_INDICATOR_TYPES.SI_NONE,
      userId: 'd2161b1e-7b85-4f33-b1cc-ff11bca2f819',
    },
  ],
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};

const proposedStipDecisionLegacyServed = {
  createdAt: '2018-11-21T20:49:28.192Z',
  docketEntryId: '4070e75c-bfd6-4c25-b822-0f980a6d29fc',
  docketNumber: '156-21',
  documentTitle: 'Proposed Stipulated Decision',
  documentType: 'Proposed Stipulated Decision',
  eventCode: 'PSDE',
  filedBy: 'Test Petitioner',
  index: 6,
  isFileAttached: true,
  isLegacyServed: true,
  isOnDocketRecord: true,
  processingStatus: 'pending',
  userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
};

const legacyServedDocumentCase = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Sixth Migrated Case',
  docketEntries: [
    ...MOCK_CASE.docketEntries,
    {
      createdAt: '2018-11-21T20:49:28.192Z',
      description: 'Answer',
      docketEntryId: 'b868a8d3-6990-4b6b-9ccd-b04b22f075a0',
      docketNumber: '101-21',
      documentTitle: 'Answer',
      documentType: 'Answer',
      eventCode: 'A',
      filedBy: 'Test Petitioner',
      filingDate: '2018-11-21T20:49:28.192Z',
      index: 4,
      isLegacyServed: true,
      isOnDocketRecord: true,
      pending: true,
      processingStatus: 'complete',
      userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
    },
    proposedStipDecisionLegacyServed,
  ],
  docketNumber: '156-21',
  preferredTrialCity: 'Washington, District of Columbia',
  status: STATUS_TYPES.new,
};

const caseWithEAccess = {
  ...MOCK_CASE,
  associatedJudge: CHIEF_JUDGE,
  caseCaption: 'The Sixth Migrated Case',
  contactPrimary: {
    ...MOCK_CASE.contactPrimary,
    email: 'petitioner@example.com',
    hasEAccess: true,
  },
  docketNumber: '192-15',
  preferredTrialCity: 'Washington, District of Columbia',
  status: STATUS_TYPES.calendared,
  trialSessionId: '959c4338-0fac-42eb-b0eb-d53b8d0195cc',
};

const legacyDeadline = {
  associatedJudge: 'Buch',
  caseDeadlineId: 'ad1e1b24-f3c4-47b4-b10e-76d1d050b2ab',
  createdAt: '2020-01-01T01:02:15.185-04:00',
  deadlineDate: '2020-01-24T00:00:00.000-05:00',
  description: 'Due date migrated from Blackstone',
  docketNumber: otherFilersCase.docketNumber,
  entityName: 'CaseDeadline',
};

describe('Case migration journey', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterAll(() => {
    test.closeSocket();
  });

  it('should migrate cases', async () => {
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      firstConsolidatedCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      secondConsolidatedCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      correspondenceCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      otherPetitionersCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      otherFilersCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      legacyServedDocumentCase,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      caseWithEAccess,
    );
    await axiosInstance.post(
      'http://localhost:4000/migrate/case-deadline',
      legacyDeadline,
    );

    await refreshElasticsearchIndex();
  });

  loginAs(test, 'docketclerk@example.com');

  it('Docketclerk views both consolidated case details', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: firstConsolidatedCase.docketNumber,
    });
    expect(test.getState('caseDetail.consolidatedCases').length).toBe(2);
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: secondConsolidatedCase.docketNumber,
    });
    expect(test.getState('caseDetail.consolidatedCases').length).toBe(2);

    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: correspondenceCase.docketNumber,
    });
    expect(test.getState('caseDetail.correspondence').length).toBe(1);
  });

  it('Docketclerk views case with other filers', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: otherFilersCase.docketNumber,
    });
    expect(test.getState('caseDetail.otherFilers').length).toBe(2);
  });

  it('Docketclerk views case with other petitioners', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: otherPetitionersCase.docketNumber,
    });
    expect(test.getState('caseDetail.otherPetitioners').length).toBe(1);
    expect(test.getState('caseDetail.privatePractitioners.0.barNumber')).toBe(
      'PT1234',
    );
    expect(test.getState('caseDetail.privatePractitioners.0.email')).toBe(
      'privatePractitioner@example.com',
    );
    expect(
      test.getState('caseDetail.privatePractitioners.0.representing.0'),
    ).toBe('dd0ac156-aa2d-46e7-8b5a-902f1d16f199');
    // override contact data with what's already in the database
    expect(test.getState('caseDetail.irsPractitioners.0.contact.city')).toBe(
      'Chicago',
    );
    expect(test.getState('caseDetail.irsPractitioners.0.email')).toBe(
      'irsPractitioner@example.com',
    );
    expect(
      test.getState('caseDetail.privatePractitioners.0.contact.city'),
    ).toBe('Chicago');
  });

  it('Docketclerk views case with legacy served documents', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: legacyServedDocumentCase.docketNumber,
    });
    const caseDocuments = test.getState('caseDetail.docketEntries');
    expect(caseDocuments.length).toBe(5);

    const legacyServedDocument = caseDocuments.find(d => d.isLegacyServed);
    expect(legacyServedDocument.servedAt).toBeUndefined();

    const formattedCase = runCompute(formattedCaseDetail, {
      state: test.getState(),
    });
    expect(formattedCase.formattedDocketEntries[1].showNotServed).toBe(false);
    expect(formattedCase.formattedDocketEntries[1].isInProgress).toBe(false);

    expect(
      formattedCase.formattedPendingDocketEntriesOnDocketRecord,
    ).toMatchObject([
      {
        docketEntryId: 'b868a8d3-6990-4b6b-9ccd-b04b22f075a0',
        documentTitle: 'Answer',
        documentType: 'Answer',
        eventCode: 'A',
        isLegacyServed: true,
        isOnDocketRecord: true,
        pending: true,
      },
      {
        docketEntryId: '4070e75c-bfd6-4c25-b822-0f980a6d29fc',
        docketNumber: '156-21',
        documentTitle: 'Proposed Stipulated Decision',
        documentType: 'Proposed Stipulated Decision',
      },
    ]);

    await test.runSequence('gotoPendingReportSequence');
    await test.runSequence('setPendingReportSelectedJudgeSequence', {
      judge: CHIEF_JUDGE,
    });
    const pendingItems = test.getState('pendingReports.pendingItems');
    expect(pendingItems.length).toBeGreaterThan(0);
    const pendingItemsForThisCase = pendingItems.filter(
      item => item.docketNumber === legacyServedDocumentCase.docketNumber,
    );

    expect(pendingItemsForThisCase).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          {
            associatedJudge: 'Chief Judge',
            caseCaption: 'The Sixth Migrated Case',
            docketEntryId: 'def81f4d-1e47-423a-8caf-6d2fdc3d3859',
            docketNumber: '156-21',
            docketNumberSuffix: null,
            documentTitle: 'Proposed Stipulated Decision',
            documentType: 'Proposed Stipulated Decision',
            status: 'New',
          },
          {
            associatedJudge: 'Chief Judge',
            caseCaption: 'The Sixth Migrated Case',
            docketEntryId: '4070e75c-bfd6-4c25-b822-0f980a6d29fc',
            docketNumber: '156-21',
            docketNumberSuffix: null,
            documentTitle: 'Proposed Stipulated Decision',
            documentType: 'Proposed Stipulated Decision',
            status: 'New',
          },
          {
            docketEntryId: 'b868a8d3-6990-4b6b-9ccd-b04b22f075a0',
            documentTitle: 'Answer',
            documentType: 'Answer',
          },
        ),
      ]),
    );

    await test.runSequence('changeTabAndSetViewerDocumentToDisplaySequence', {
      docketRecordTab: 'documentView',
      viewerDocumentToDisplay: {
        docketEntryId: proposedStipDecisionLegacyServed.docketEntryId,
      },
    });

    const documentViewer = runCompute(documentViewerHelper, {
      state: test.getState(),
    });

    expect(documentViewer.showSignStipulatedDecisionButton).toBeTruthy();
  });

  loginAs(test, 'privatePractitioner@example.com');

  it('private practitioner sees migrated case on their dashboard', async () => {
    expect(test.getState('currentPage')).toEqual('DashboardPractitioner');

    const openCases = test.getState('openCases');
    const foundCase = openCases.find(
      c => c.docketNumber === otherPetitionersCase.docketNumber,
    );
    expect(foundCase).toBeDefined();
  });

  loginAs(test, 'irsPractitioner@example.com');

  it('IRS practitioner sees migrated case on their dashboard', async () => {
    expect(test.getState('currentPage')).toEqual('DashboardRespondent');

    const openCases = test.getState('openCases');
    const foundCase = openCases.find(
      c => c.docketNumber === otherPetitionersCase.docketNumber,
    );
    expect(foundCase).toBeDefined();
  });

  it('Docketclerk searches for correspondence case by petitioner name and finds it', async () => {
    await test.runSequence('gotoAdvancedSearchSequence');

    await test.runSequence('updateAdvancedSearchFormValueSequence', {
      formType: 'caseSearchByName',
      key: 'petitionerName',
      value: correspondenceCaseOriginalPetitionerName,
    });

    await test.runSequence('submitCaseAdvancedSearchSequence');

    expect(
      test
        .getState(`searchResults.${ADVANCED_SEARCH_TABS.CASE}`)
        .find(
          result =>
            result.contactPrimary.name ===
            correspondenceCaseOriginalPetitionerName,
        ),
    ).toBeDefined();
  });

  it('should re-migrate an existing case', async () => {
    const correspondenceCaseOverwritten = {
      ...correspondenceCase,
      caseCaption: 'The Third Migrated Case, Overwritten',
      contactPrimary: {
        ...MOCK_CASE.contactPrimary,
        name: correspondenceCaseUpdatedPetitionerName,
      },
      correspondence: [],
    };

    await axiosInstance.post(
      'http://localhost:4000/migrate/case',
      correspondenceCaseOverwritten,
    );

    await refreshElasticsearchIndex();
  });

  loginAs(test, 'docketclerk@example.com');

  it('Docketclerk views overwritten correspondence case', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: correspondenceCase.docketNumber,
    });
    expect(test.getState('caseDetail.correspondence').length).toBe(0);
    expect(test.getState('caseDetail.caseCaption')).toBe(
      'The Third Migrated Case, Overwritten',
    );
  });

  it('Docketclerk searches for correspondence case by original petitioner name and does not find it', async () => {
    await test.runSequence('gotoAdvancedSearchSequence');

    await test.runSequence('updateAdvancedSearchFormValueSequence', {
      formType: 'caseSearchByName',
      key: 'petitionerName',
      value: correspondenceCaseOriginalPetitionerName,
    });

    await test.runSequence('submitCaseAdvancedSearchSequence');

    expect(
      test
        .getState(`searchResults.${ADVANCED_SEARCH_TABS.CASE}`)
        .find(
          result =>
            result.contactPrimary.name ===
            correspondenceCaseOriginalPetitionerName,
        ),
    ).not.toBeDefined();
  });

  it('Docketclerk searches for correspondence case by updated petitioner name and finds it', async () => {
    await test.runSequence('gotoAdvancedSearchSequence');

    await test.runSequence('updateAdvancedSearchFormValueSequence', {
      formType: 'caseSearchByName',
      key: 'petitionerName',
      value: correspondenceCaseUpdatedPetitionerName,
    });

    await test.runSequence('submitCaseAdvancedSearchSequence');

    expect(
      test
        .getState(`searchResults.${ADVANCED_SEARCH_TABS.CASE}`)
        .find(
          result =>
            result.contactPrimary.name ===
            correspondenceCaseUpdatedPetitionerName,
        ),
    ).toBeDefined();
  });

  it('Docketclerk views case with casedeadlines', async () => {
    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: otherFilersCase.docketNumber,
    });
    expect(test.getState('caseDeadlines').length).toBe(1);
  });

  loginAs(test, 'petitioner@example.com');

  it('user with e-access should see migrated e-access case on their dashboard', async () => {
    await test.runSequence('gotoDashboardSequence');

    expect(test.getState('currentPage')).toBe('DashboardPetitioner');

    const openCases = test.getState('openCases');

    expect(
      openCases.find(c => c.docketNumber === caseWithEAccess.docketNumber),
    ).toBeDefined();

    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: caseWithEAccess.docketNumber,
    });

    expect(test.getState('caseDetail.docketNumber')).toEqual(
      caseWithEAccess.docketNumber,
    );
  });
});