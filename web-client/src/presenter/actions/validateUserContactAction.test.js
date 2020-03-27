import { applicationContextForClient as applicationContext } from '../../../../shared/src/business/test/createTestApplicationContext';
import { presenter } from '../presenter';
import { runAction } from 'cerebral/test';
import { validateUserContactAction } from './validateUserContactAction';

const errorMock = jest.fn();
const successMock = jest.fn();

describe('validateUserContactAction', () => {
  beforeEach(() => {
    presenter.providers.applicationContext = applicationContext;
    presenter.providers.path = {
      error: errorMock,
      success: successMock,
    };
  });

  it('should return the error path if user is invalid', async () => {
    applicationContext
      .getUseCases()
      .validateUserContactInteractor.mockReturnValue('something went wrong');
    runAction(validateUserContactAction, {
      modules: {
        presenter,
      },
      state: { form: { contact: {} } },
    });
    expect(errorMock).toHaveBeenCalled();
  });

  it('should return the success path if user is valid', async () => {
    applicationContext
      .getUseCases()
      .validateUserContactInteractor.mockReturnValue(undefined);
    runAction(validateUserContactAction, {
      modules: {
        presenter,
      },
      state: { form: { contact: {} } },
    });
    expect(successMock).toHaveBeenCalled();
  });
});
