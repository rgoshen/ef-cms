import {
  ChallengeNameType,
  UserStatusType,
} from '@aws-sdk/client-cognito-identity-provider';
import { applicationContext } from '../../../../shared/src/business/test/createTestApplicationContext';
import { changePassword } from '@web-api/gateways/user/changePassword';
import { changePasswordInteractor } from '@shared/proxies/auth/changePasswordProxy';

describe('changePassword', () => {
  it('should make a call update the password for the account with the provided email', async () => {
    const mockEmail = 'test@example.com';
    const mockNewPassword = 'P@ssw0rd';
    const mockCode = 'afde08bd-7ccc-4163-9242-87f78cbb2452';
    const mockCognitoClientId = 'test';
    applicationContext.environment.cognitoClientId = mockCognitoClientId;

    await changePassword(applicationContext, {
      code: mockCode,
      email: mockEmail,
      newPassword: mockNewPassword,
    });

    expect(
      applicationContext.getCognito().confirmForgotPassword,
    ).toHaveBeenCalledWith({
      ClientId: mockCognitoClientId,
      ConfirmationCode: mockCode,
      Password: mockNewPassword,
      Username: mockEmail,
    });
  });

  it('should update the user`s password in persistence when they are in NEW_PASSWORD_REQUIRED state and their change password request is valid', async () => {
    const mockSession = 'test';
    const mockEmail = 'test@example.com';
    const mockPassword = '123';

    applicationContext.getCognito().adminGetUser.mockResolvedValue({
      UserStatus: UserStatusType.FORCE_CHANGE_PASSWORD,
    });

    applicationContext.getCognito().initiateAuth.mockResolvedValue({
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      Session: mockSession,
    });

    await changePasswordInteractor(applicationContext, {
      confirmPassword: mockPassword,
      email: mockEmail,
      password: mockPassword,
      tempPassword: mockPassword,
    });

    expect(
      applicationContext.getCognito().respondToAuthChallenge,
    ).toHaveBeenCalledWith({
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      ChallengeResponses: {
        NEW_PASSWORD: mockPassword,
        USERNAME: mockEmail,
      },
      ClientId: applicationContext.environment.cognitoClientId,
      Session: 'test',
    });
  });
});
