import { User } from '@shared/business/entities/User';
import { requireEnvVars } from '../../shared/admin-tools/util';
requireEnvVars(['ENV', 'REGION', 'DYNAMODB_TABLE_NAME', 'DYNAMODB_ENDPOINT']);
import { createApplicationContext } from '@web-api/applicationContext';

/**
How to Run:

npx ts-node --transpile-only scripts/judgeUpdates/update-judge-isSeniorJudge.ts
*/

// ******************************** INPUTS ******************************
const judgesToUpdateIds: { userId: string; isSeniorJudge: boolean }[] = [
  {
    isSeniorJudge: true,
    userId: '111111-11111-1111-111111-111111',
  },
];
// **********************************************************************

(async () => {
  const applicationContext = createApplicationContext({});

  for (let judge of judgesToUpdateIds) {
    const { userId } = judge;

    const userToUpdate = await applicationContext
      .getPersistenceGateway()
      .getUserById({ applicationContext, userId });
    const userEntity = new User(userToUpdate);
    userEntity.isSeniorJudge = judge.isSeniorJudge;

    await applicationContext.getPersistenceGateway().updateUser({
      applicationContext,
      user: userEntity.validate().toRawObject(),
    });
  }
})();