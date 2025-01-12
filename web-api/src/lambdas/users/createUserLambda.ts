import { createUserInteractor } from '@web-api/business/useCases/user/createUserInteractor';
import { genericHandler } from '../../genericHandler';

// This is a special lambda that is only meant to be used by admins.
export const createUserLambda = event =>
  genericHandler(event, async ({ applicationContext }) => {
    return await createUserInteractor(applicationContext, {
      user: JSON.parse(event.body),
    });
  });
