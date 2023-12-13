import { FORMATS } from '@shared/business/utilities/DateHandler';
import { contactPrimaryFromState, waitForCondition } from '../helpers';

export const docketClerkAddsTrackedDocketEntry = (
  cerebralTest,
  fakeFile,
  paperServiceRequested = false,
) => {
  return it('Docketclerk adds tracked paper filing', async () => {
    await cerebralTest.runSequence('gotoCaseDetailSequence', {
      docketNumber: cerebralTest.docketNumber,
    });

    await cerebralTest.runSequence('gotoAddPaperFilingSequence', {
      docketNumber: cerebralTest.docketNumber,
    });

    await cerebralTest.runSequence('submitPaperFilingSequence');

    expect(cerebralTest.getState('validationErrors')).toMatchObject({
      documentType: 'Select a document type',
      eventCode: 'Select a document type',
      filers: 'Select a filing party',
      primaryDocumentFile:
        'Scan or upload a document to serve, or click Save for Later to serve at a later time',
      receivedAt: 'Enter a valid date received',
    });

    await cerebralTest.runSequence(
      'formatAndUpdateDateFromDatePickerSequence',
      {
        key: 'receivedAt',
        toFormat: FORMATS.ISO,
        value: '1/1/2018',
      },
    );

    await cerebralTest.runSequence('updateDocketEntryFormValueSequence', {
      key: 'primaryDocumentFile',
      value: fakeFile,
    });

    await cerebralTest.runSequence('updateDocketEntryFormValueSequence', {
      key: 'primaryDocumentFileSize',
      value: 100,
    });

    const contactPrimary = contactPrimaryFromState(cerebralTest);

    await cerebralTest.runSequence(
      'updateFileDocumentWizardFormValueSequence',
      {
        key: `filersMap.${contactPrimary.contactId}`,
        value: true,
      },
    );

    await cerebralTest.runSequence('updateDocketEntryFormValueSequence', {
      key: 'eventCode',
      value: 'APPL',
    });

    expect(cerebralTest.getState('form.documentType')).toEqual('Application');

    await cerebralTest.runSequence('submitPaperFilingSequence');

    expect(cerebralTest.getState('validationErrors')).toEqual({
      freeText: 'Provide an answer',
    });

    await cerebralTest.runSequence('updateDocketEntryFormValueSequence', {
      key: 'freeText',
      value: 'Application for Flavortown',
    });

    await cerebralTest.runSequence('submitPaperFilingSequence');

    expect(cerebralTest.getState('validationErrors')).toEqual({});

    await waitForCondition({
      booleanExpressionCondition: () =>
        cerebralTest.getState('currentPage') === 'CaseDetailInternal',
    });

    if (!paperServiceRequested) {
      expect(cerebralTest.getState('alertSuccess').message).toEqual(
        'Your entry has been added to the docket record.',
      );

      expect(cerebralTest.getState('currentPage')).toEqual(
        'CaseDetailInternal',
      );
    } else {
      expect(cerebralTest.getState('pdfPreviewUrl')).toBeDefined();
      expect(cerebralTest.getState('currentPage')).toEqual('PrintPaperService');
    }
    expect(cerebralTest.getState('form')).toEqual({});

    expect(cerebralTest.getState('caseDetail.hasPendingItems')).toEqual(true);
    expect(cerebralTest.getState('caseDetail.automaticBlocked')).toEqual(true);
  });
};
