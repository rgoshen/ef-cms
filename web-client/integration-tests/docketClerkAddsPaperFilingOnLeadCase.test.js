import { docketClerkAddsPaperFiledMultiDocketableDocketEntryAndSavesForLater } from './journey/docketClerkAddsPaperFiledMultiDocketableDocketEntryAndSavesForLater';
import { docketClerkAddsPaperFiledMultiDocketableDocketEntryAndServes } from './journey/docketClerkAddsPaperFiledMultiDocketableDocketEntryAndServes';
import { docketClerkConsolidatesCases } from './journey/docketClerkConsolidatesCases';
import { docketClerkOpensCaseConsolidateModal } from './journey/docketClerkOpensCaseConsolidateModal';
import { docketClerkSearchesForCaseToConsolidateWith } from './journey/docketClerkSearchesForCaseToConsolidateWith';
import { docketClerkUpdatesCaseStatusToReadyForTrial } from './journey/docketClerkUpdatesCaseStatusToReadyForTrial';
import {
  loginAs,
  setupTest,
  uploadPetition,
  waitForLoadingComponentToHide,
} from './helpers';
import { petitionsClerkServesElectronicCaseToIrs } from './journey/petitionsClerkServesElectronicCaseToIrs';

describe('Docket clerk adds paper filing on lead case', () => {
  const cerebralTest = setupTest();

  cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries = [];

  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  it('login as a petitioner and create the lead case', async () => {
    const caseDetail = await uploadPetition(cerebralTest);

    expect(caseDetail.docketNumber).toBeDefined();

    cerebralTest.docketNumber = cerebralTest.leadDocketNumber =
      caseDetail.docketNumber;
    cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries.push(
      cerebralTest.docketNumber,
    );
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkServesElectronicCaseToIrs(cerebralTest);

  loginAs(cerebralTest, 'docketclerk@example.com');
  docketClerkUpdatesCaseStatusToReadyForTrial(cerebralTest);

  it('login as a petitioner and create a case to consolidate with', async () => {
    const caseDetail = await uploadPetition(cerebralTest);

    expect(caseDetail.docketNumber).toBeDefined();

    cerebralTest.docketNumber = caseDetail.docketNumber;
    cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries.push(
      cerebralTest.docketNumber,
    );
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkServesElectronicCaseToIrs(cerebralTest);

  loginAs(cerebralTest, 'docketclerk@example.com');
  docketClerkUpdatesCaseStatusToReadyForTrial(cerebralTest);
  docketClerkOpensCaseConsolidateModal(cerebralTest);
  docketClerkSearchesForCaseToConsolidateWith(cerebralTest);
  docketClerkConsolidatesCases(cerebralTest, 2);

  // this is going through save AND serve flow
  docketClerkAddsPaperFiledMultiDocketableDocketEntryAndServes(
    cerebralTest,
    'A',
  );

  it('verify multi-docketed document has been filed on every case in the consolidated group', async () => {
    for (const docketNumber of cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries) {
      await cerebralTest.runSequence('gotoCaseDetailSequence', {
        docketNumber,
      });

      const multiDocketedDocketEntry = cerebralTest
        .getState('caseDetail.docketEntries')
        .find(
          doc => doc.docketEntryId === cerebralTest.multiDocketedDocketEntryId,
        );

      expect(multiDocketedDocketEntry).toBeDefined();
    }
  });

  // this needs to be done on the lead case
  docketClerkAddsPaperFiledMultiDocketableDocketEntryAndSavesForLater(
    cerebralTest,
    'RPT',
  );

  it('docket clerk serves document from case detail document view', async () => {
    console.log(cerebralTest.leadDocketNumber, '****');
    await cerebralTest.runSequence(
      'openConfirmServeCourtIssuedDocumentSequence',
      {
        docketEntryId: cerebralTest.multiDocketedDocketEntryId,
        redirectUrl: `/case-detail/${cerebralTest.leadDocketNumber}/document-view?docketEntryId=${cerebralTest.multiDocketedDocketEntryId}`,
      },
    );

    expect(cerebralTest.getState('modal.showModal')).toEqual(
      'ConfirmInitiateCourtIssuedDocumentServiceModal',
    );

    await cerebralTest.runSequence('serveCourtIssuedDocumentSequence');

    await waitForLoadingComponentToHide({ cerebralTest });

    expect(cerebralTest.getState('alertSuccess')).toEqual({
      message: 'Document served to selected cases in group. ',
      overwritable: false,
    });

    expect(
      cerebralTest.getState('currentViewMetadata.caseDetail.docketRecordTab'),
    ).toEqual('documentView');
  });

  it('verify multi-docketed document has been filed on every case in the consolidated group', async () => {
    console.log(
      '****** consolidatedCasesThatShouldReceiveDocketEntries',
      cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries,
    );
    console.log(
      '****** multiDocketedDocketEntryId',
      cerebralTest.multiDocketedDocketEntryId,
    );

    for (const docketNumber of cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries) {
      await cerebralTest.runSequence('gotoCaseDetailSequence', {
        docketNumber,
      });

      const multiDocketedDocketEntry = cerebralTest
        .getState('caseDetail.docketEntries')
        .find(
          doc => doc.docketEntryId === cerebralTest.multiDocketedDocketEntryId,
        );

      expect(multiDocketedDocketEntry).toBeDefined();
    }
  });

  it('verify a completed work item exists for each case in the consolidated group that the document was filed on', async () => {
    // go to work item => processed
    await cerebralTest.runSequence('gotoWorkQueueSequence');
    await cerebralTest.runSequence('chooseWorkQueueSequence', {
      box: 'outbox',
      queue: 'my',
    });

    const outboxQueue = cerebralTest.getState('workQueue');

    for (const docketNumber of cerebralTest.consolidatedCasesThatShouldReceiveDocketEntries) {
      console.log;
      const outboxWorkItem = outboxQueue.find(
        workItem => workItem.docketNumber.docketNumber === docketNumber,
      );

      expect(outboxWorkItem).toMatchObject({
        docketEntryId: cerebralTest.docketEntryId,
        eventCode: 'A',
      });
    }
  });
});
