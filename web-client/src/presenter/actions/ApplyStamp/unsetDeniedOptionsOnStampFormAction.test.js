import { applicationContextForClient as applicationContext } from '../../../../../shared/src/business/test/createTestApplicationContext';
import { presenter } from '../../presenter-mock';
import { runAction } from 'cerebral/test';
import { unsetDeniedOptionsOnStampFormAction } from './unsetDeniedOptionsOnStampFormAction';

describe('unsetDeniedOptionsOnStampFormAction', () => {
  presenter.providers.applicationContext = applicationContext;

  it('should unset denied options on the form when stampOrderStatus is "Granted"', async () => {
    const result = await runAction(unsetDeniedOptionsOnStampFormAction, {
      modules: {
        presenter,
      },
      state: {
        form: {
          deniedAsMoot: true,
          deniedWithoutPrejudice: true,
          status: 'Granted',
        },
      },
    });

    expect(result.state.form.deniedAsMoot).toBeUndefined();
    expect(result.state.form.deniedWithoutPrejudice).toBeUndefined();
  });

  it('should not unset denied options on the form when stampOrderStatus is "Denied"', async () => {
    const result = await runAction(unsetDeniedOptionsOnStampFormAction, {
      modules: {
        presenter,
      },
      state: {
        form: {
          deniedAsMoot: true,
          deniedWithoutPrejudice: true,
          status: 'Denied',
        },
      },
    });

    expect(result.state.form.deniedAsMoot).toBeDefined();
    expect(result.state.form.deniedWithoutPrejudice).toBeDefined();
  });
});
