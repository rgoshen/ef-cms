import {
  CASE_STATUS_TYPES,
  COUNTRY_TYPES,
  PARTY_TYPES,
} from '../../shared/src/business/entities/EntityConstants';
import { createISODateString } from '../../shared/src/business/utilities/DateHandler';
import { docketClerkAddsAndServesDocketEntryFromOrder } from './journey/docketClerkAddsAndServesDocketEntryFromOrder';
import { docketClerkAssignWorkItemToSelf } from './journey/docketClerkAssignWorkItemToSelf';
import { docketClerkCreatesATrialSession } from './journey/docketClerkCreatesATrialSession';
import { docketClerkCreatesAnOrder } from './journey/docketClerkCreatesAnOrder';
import { docketClerkManuallyAddsCaseToTrialSessionWithoutNote } from './journey/docketClerkManuallyAddsCaseToTrialSessionWithoutNote';
import { docketClerkSignsOrder } from './journey/docketClerkSignsOrder';
import { docketClerkViewsAssignedWorkItemEditLink } from './journey/docketClerkViewsAssignedWorkItemEditLink';
import { docketClerkViewsDraftOrder } from './journey/docketClerkViewsDraftOrder';
import { docketClerkViewsQCInProgress } from './journey/docketClerkViewsQCInProgress';
import { docketClerkViewsQCOutbox } from './journey/docketClerkViewsQCOutbox';
import { fakeFile } from '../integration-tests-public/helpers';
import { loginAs, setupTest, uploadPetition } from './helpers';
import { markAllCasesAsQCed } from './journey/markAllCasesAsQCed';
import { petitionsClerkServesElectronicCaseToIrs } from './journey/petitionsClerkServesElectronicCaseToIrs';
import { petitionsClerkSetsATrialSessionsSchedule } from './journey/petitionsClerkSetsATrialSessionsSchedule';
import { petitionsClerkViewsNewTrialSession } from './journey/petitionsClerkViewsNewTrialSession';
import { practitionerRequestsAccessToCase } from './journey/practitionerRequestsAccessToCase';

describe('Docket Clerk Document QC Journey', () => {
  const cerebralTest = setupTest();

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  const trialLocation = `Pheonix, Arizona, ${Date.now()}`;
  const overrides = {
    maxCases: 3,
    preferredTrialCity: trialLocation,
    sessionType: 'Small',
    trialDate: {
      day: '20',
      month: '01',
      year: '2040',
    },
    trialLocation,
  };

  loginAs(cerebralTest, 'docketclerk@example.com');
  docketClerkCreatesATrialSession(cerebralTest, overrides);

  loginAs(cerebralTest, 'petitioner@example.com');
  it('petitioner creates electronic case', async () => {
    const { docketNumber } = await uploadPetition(cerebralTest, {
      contactSecondary: {
        address1: '734 Cowley Parkway',
        city: 'Amazing',
        countryType: COUNTRY_TYPES.DOMESTIC,
        name: 'Jimothy Schultz',
        phone: '+1 (884) 358-9729',
        postalCode: '77546',
        state: 'AZ',
      },
      partyType: PARTY_TYPES.petitionerSpouse,
    });
    expect(docketNumber).toBeDefined();

    cerebralTest.docketNumber = docketNumber;
  });

  loginAs(cerebralTest, 'docketclerk@example.com');
  docketClerkManuallyAddsCaseToTrialSessionWithoutNote(cerebralTest);

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkViewsNewTrialSession(cerebralTest);
  markAllCasesAsQCed(cerebralTest, () => [cerebralTest.docketNumber]);
  petitionsClerkSetsATrialSessionsSchedule(cerebralTest);

  loginAs(cerebralTest, 'docketclerk@example.com');

  docketClerkCreatesAnOrder(cerebralTest, {
    documentTitle: 'Order to do something',
    eventCode: 'O',
    expectedDocumentType: 'Order',
  });
  docketClerkViewsDraftOrder(cerebralTest);
  docketClerkSignsOrder(cerebralTest);
  docketClerkAddsAndServesDocketEntryFromOrder(cerebralTest, 0);

  docketClerkViewsQCInProgress(cerebralTest, false);
  docketClerkViewsQCOutbox(cerebralTest, true);

  it('should have a trial date and trial location on workItem associated with a calendared case', () => {
    const workQueue = cerebralTest.getState('workQueue');
    const calendaredWorkItem = workQueue.find(
      workItem =>
        workItem.docketEntry.docketEntryId === cerebralTest.docketEntryId,
    );

    const expectedTrialDate = createISODateString(
      `${overrides.trialDate.year}-${overrides.trialDate.month}-${overrides.trialDate.day}`,
    );

    expect(calendaredWorkItem.caseStatus).toBe(CASE_STATUS_TYPES.calendared);
    expect(calendaredWorkItem.trialDate).toEqual(expectedTrialDate);
    expect(calendaredWorkItem.trialLocation).toEqual(trialLocation);
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkServesElectronicCaseToIrs(cerebralTest);

  loginAs(cerebralTest, 'privatepractitioner@example.com');
  practitionerRequestsAccessToCase(cerebralTest, fakeFile);

  loginAs(cerebralTest, 'docketclerk@example.com');
  docketClerkAssignWorkItemToSelf(cerebralTest);

  // Bug 6934 - Bug was caused when the work item was marked as read,
  // causing the link to change for the work item.
  docketClerkViewsAssignedWorkItemEditLink(cerebralTest);
});
