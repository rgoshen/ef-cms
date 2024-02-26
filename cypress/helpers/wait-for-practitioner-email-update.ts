import { cypressEnv } from './env/cypressEnvironment';
import { getCognitoUserIdByEmail } from '../support/cognito-login';
import { getDocumentClient } from './dynamo/getDynamoCypress';

export async function waitForPractitionerEmailUpdate({
  attempts = 0,
  docketNumber,
  practitionerEmail,
}: {
  docketNumber: string;
  practitionerEmail: string;
  attempts?: number;
}): Promise<boolean> {
  const maxAttempts = 10;
  const practitionerUserId = await getCognitoUserIdByEmail(practitionerEmail);
  const result = await getDocumentClient().get({
    Key: {
      pk: `case|${docketNumber}`,
      sk: `privatePractitioner|${practitionerUserId}`,
    },
    TableName: cypressEnv.dynamoDbTableName,
  });

  const practitionerCaseRecordEmail = result.Item?.email;

  if (practitionerCaseRecordEmail === practitionerEmail) {
    return true;
  }

  if (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return waitForPractitionerEmailUpdate({
      attempts: attempts + 1,
      docketNumber,
      practitionerEmail,
    });
  } else {
    return false;
  }
}
