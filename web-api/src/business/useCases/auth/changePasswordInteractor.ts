// import { RespondToAuthChallengeCommandInput } from '@aws-sdk/client-cognito-identity-provider';
import { ChangePasswordForm } from '@shared/business/entities/ChangePasswordForm';
import { InvalidEntityError } from '@web-api/errors/errors';
import { RespondToAuthChallengeCommandInput } from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/RespondToAuthChallengeCommand';
import { ServerApplicationContext } from '@web-api/applicationContext';
import { authErrorHandling } from '@web-api/business/useCases/auth/loginInteractor';

export const changePasswordInteractor = async (
  applicationContext: ServerApplicationContext,
  {
    confirmPassword,
    password,
    tempPassword,
    userEmail,
  }: {
    password: string;
    tempPassword: string;
    userEmail: string;
    confirmPassword: string;
  },
): Promise<{ idToken: string; accessToken: string; refreshToken: string }> => {
  try {
    const errors = new ChangePasswordForm({
      confirmPassword,
      password,
      userEmail,
    }).getFormattedValidationErrors();
    if (errors) {
      throw new InvalidEntityError('Change Password Form Entity is invalid');
    }

    const initiateAuthResult = await applicationContext
      .getCognito()
      .initiateAuth({
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          PASSWORD: tempPassword,
          USERNAME: userEmail,
        },
        ClientId: applicationContext.environment.cognitoClientId,
      });

    if (initiateAuthResult?.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const params: RespondToAuthChallengeCommandInput = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ChallengeResponses: {
          NEW_PASSWORD: password,
          USERNAME: userEmail,
        },
        ClientId: process.env.COGNITO_CLIENT_ID,
        Session: initiateAuthResult.Session,
      };

      const cognito = applicationContext.getCognito();
      const result = await cognito.respondToAuthChallenge(params);

      return {
        accessToken: result.AuthenticationResult!.AccessToken!,
        idToken: result.AuthenticationResult!.IdToken!,
        refreshToken: result.AuthenticationResult!.RefreshToken!,
      };
    }

    throw new Error('User is not `FORCE_CHANGE_PASSWORD` state');
  } catch (err: any) {
    await authErrorHandling(applicationContext, {
      email: userEmail,
      error: err,
      sendAccountConfirmation: false,
    });
    throw err;
  }
};
