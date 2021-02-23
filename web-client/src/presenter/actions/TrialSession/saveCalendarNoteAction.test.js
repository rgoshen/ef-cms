import { applicationContextForClient as applicationContext } from '../../../../../shared/src/business/test/createTestApplicationContext';
import { presenter } from '../../presenter-mock';
import { runAction } from 'cerebral/test';
import { saveCalendarNoteAction } from './saveCalendarNoteAction';

describe('saveCalendarNoteAction', () => {
  presenter.providers.applicationContext = applicationContext;

  it('calls saveCalendarNoteInteractor with calendarNote, docketNumber, and trialSessionId', async () => {
    const DOCKET_NUMBER = '123-21';
    const TRIAL_SESSION_ID = 'e1638f85-86ae-4447-bb7b-3202ce816fd0';
    const NOTE = 'This is a calendar note';

    await runAction(saveCalendarNoteAction, {
      modules: { presenter },
      state: {
        caseDetail: {
          docketNumber: DOCKET_NUMBER,
          trialSessionId: TRIAL_SESSION_ID,
        },
        modal: {
          note: NOTE,
        },
      },
    });

    expect(
      applicationContext.getUseCases().saveCalendarNoteInteractor.mock
        .calls[0][0],
    ).toMatchObject({
      calendarNote: NOTE,
      docketNumber: DOCKET_NUMBER,
      trialSessionId: TRIAL_SESSION_ID,
    });
  });
});