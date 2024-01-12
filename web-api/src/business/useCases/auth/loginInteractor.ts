import { ServerApplicationContext } from '@web-api/applicationContext';
import { UnauthorizedError, UnknownUserError } from '@web-api/errors/errors';

export const loginInteractor = async (
  applicationContext: ServerApplicationContext,
  { email, password }: { email: string; password: string },
): Promise<{ idToken: string; accessToken: string; refreshToken: string }> => {
  try {
    const result = await applicationContext.getCognito().initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        PASSWORD: password,
        USERNAME: email,
      },
      ClientId: applicationContext.environment.cognitoClientId,
    });

    console.log('*** result', result);

    if (result?.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      console.log('NEW_PASSWORD_REQUIRED');
      const PasswordChangeError = new Error('NewPasswordRequired');
      PasswordChangeError.name = 'NewPasswordRequired';
      throw PasswordChangeError;
    }

    return {
      accessToken: result.AuthenticationResult!.AccessToken!,
      idToken: result.AuthenticationResult!.IdToken!,
      refreshToken: result.AuthenticationResult!.RefreshToken!,
    };
  } catch (err: any) {
    console.log('*** err', err);

    if (
      err.name === 'InvalidPasswordException' ||
      err.name === 'NotAuthorizedException'
    ) {
      throw new UnknownUserError('Invalid Username or Password'); //401
    }

    if (err.name === 'UserNotConfirmedException') {
      await resendAccountConfirmation(applicationContext, email);

      throw new UnauthorizedError('User is unconfirmed'); //403
    }

    throw err;
  }
};

async function resendAccountConfirmation(
  applicationContext: ServerApplicationContext,
  email: string,
): Promise<void> {
  const cognito = applicationContext.getCognito();

  const users = await cognito.listUsers({
    AttributesToGet: ['sub', 'custom:userId'],
    Filter: `email = "${email}"`,
    UserPoolId: process.env.USER_POOL_ID,
  });

  // TODO: extract to utility
  const userIdAttribute =
    users.Users?.[0].Attributes?.find(element => {
      if (element.Name === 'custom:userId') {
        return element;
      }
    }) ||
    users.Users?.[0].Attributes?.find(element => {
      if (element.Name === 'sub') {
        return element;
      }
    });
  const userId = userIdAttribute?.Value!;

  await applicationContext
    .getUseCaseHelpers()
    .createUserConfirmation(applicationContext, { email, userId });
}
