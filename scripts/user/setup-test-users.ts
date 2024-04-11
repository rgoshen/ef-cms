import {
  Practitioner,
  RawPractitioner,
} from '@shared/business/entities/Practitioner';
import { ROLES } from '@shared/business/entities/EntityConstants';
import { RawUser, User } from '@shared/business/entities/User';
import {
  ServerApplicationContext,
  createApplicationContext,
} from '@web-api/applicationContext';
import {
  activateAdminAccount,
  createDawsonUser,
  deactivateAdminAccount,
} from '../../shared/admin-tools/user/admin';
import { requireEnvVars } from '../../shared/admin-tools/util';

requireEnvVars([
  'DEFAULT_ACCOUNT_PASS',
  'DEPLOYING_COLOR',
  'EFCMS_DOMAIN',
  'USTC_ADMIN_PASS',
  'USTC_ADMIN_USER',
]);

const { DEFAULT_ACCOUNT_PASS, DEPLOYING_COLOR, EFCMS_DOMAIN } = process.env;

const baseUser = {
  birthYear: '1950',
  contact: {
    address1: '234 Main St',
    address2: 'Apartment 4',
    address3: 'Under the stairs',
    city: 'Chicago',
    countryType: 'domestic',
    phone: '+1 (555) 555-5555',
    postalCode: '61234',
    state: 'IL',
  },
  employer: '',
  lastName: 'Test',
  password: DEFAULT_ACCOUNT_PASS,
  suffix: '',
};

const createManyAccounts = async (
  applicationContext: ServerApplicationContext,
  [num, role, section]: [number, string, string],
) => {
  for (let i = 1; i <= num; i++) {
    const email =
      role === 'chambers'
        ? `${section}${i}@example.com`
        : `${role}${i}@example.com`;

    const user = {
      ...baseUser,
      email,
      name: `Test ${role}${i}`,
      role,
      section,
    };
    await createOrUpdateUser(applicationContext, {
      user,
    });
  }
};

/**
 * Create Court Users
 */
const setupCourtUsers = async (
  applicationContext: ServerApplicationContext,
) => {
  const userSet: Array<[number, string, string]> = [
    [10, 'adc', 'adc'],
    [10, 'admissionsclerk', 'admissions'],
    [10, 'clerkofcourt', 'clerkofcourt'],
    [10, 'docketclerk', 'docket'],
    [10, 'petitionsclerk', 'petitions'],
    [10, 'trialclerk', 'trialClerks'],
    [5, 'caseServicesSupervisor', 'caseServicesSupervisor'],
    [2, 'floater', 'floater'],
    [2, 'general', 'general'],
    [2, 'reportersOffice', 'reportersOffice'],
    [5, 'chambers', 'ashfordsChambers'],
    [5, 'chambers', 'buchsChambers'],
    [5, 'chambers', 'cohensChambers'],
    [5, 'chambers', 'foleysChambers'],
    [5, 'chambers', 'kerrigansChambers'],
  ];

  const promises = userSet.map(user =>
    createManyAccounts(applicationContext, user),
  );
  await Promise.all(promises);
};

/**
 * Create Petitioners
 */
const setupPetitioners = async () => {
  await createManyAccounts([30, 'petitioner', 'petitioner']);
};

/**
 * Create Practitioners
 */
const setupPractitioners = async () => {
  const practitioners = {
    irsPractitioner: [
      'RT6789',
      'RT0987',
      'RT7777',
      'RT8888',
      'RT9999',
      'RT6666',
      'RT0000',
      'RT1111',
      'RT2222',
      'RT3333',
    ],
    privatePractitioner: [
      'PT1234',
      'PT5432',
      'PT1111',
      'PT2222',
      'PT3333',
      'PT4444',
      'PT5555',
      'PT6666',
      'PT7777',
      'PT8888',
    ],
  };

  for (let role in practitioners) {
    const promises = practitioners[role].map((barNumber, i) => {
      const employer = role === 'privatePractitioner' ? 'Private' : 'IRS';
      const email = `${role}${i + 1}@example.com`;
      const user = {
        ...baseUser,
        admissionsDate: '2019-03-01',
        admissionsStatus: 'Active',
        barNumber,
        email,
        employer,
        firmName: 'Some Firm',
        firstName: `${role} ${i + 1}`,
        name: `Test ${role}${i + 1}`,
        originalBarState: 'WA',
        password: DEFAULT_ACCOUNT_PASS,
        practitionerType: 'Attorney',
        role,
        section: role,
      };
      return createDawsonUser({
        deployingColorUrl: `https://api-${DEPLOYING_COLOR}.${EFCMS_DOMAIN}/users`,
        setPermanentPassword: true,
        user,
      });
    });
    await Promise.all(promises);
  }
};

async function createOrUpdateUser(
  applicationContext: ServerApplicationContext,
  {
    password,
    user,
  }: {
    user: RawUser | RawPractitioner;
    password: string;
  },
): Promise<void> {
  const userPoolId =
    user.role === ROLES.irsSuperuser
      ? process.env.USER_POOL_IRS_ID
      : process.env.USER_POOL_ID;

  const userExists = await applicationContext
    .getUserGateway()
    .getUserByEmail(applicationContext, {
      email: user.email!,
      poolId: userPoolId,
    });

  const userId = userExists?.userId || applicationContext.getUniqueId();

  let rawUser: RawUser | RawPractitioner;
  if (
    user.role === ROLES.privatePractitioner ||
    user.role === ROLES.irsPractitioner ||
    user.role === ROLES.inactivePractitioner
  ) {
    rawUser = new Practitioner({
      ...user,
      userId,
    })
      .validate()
      .toRawObject();
  } else {
    rawUser = new User({ ...user, userId }).validate().toRawObject();
  }

  await applicationContext.getPersistenceGateway().createUserRecords({
    applicationContext,
    user: rawUser,
    userId: rawUser.userId,
  });

  if (userExists) {
    await applicationContext.getUserGateway().updateUser(applicationContext, {
      attributesToUpdate: {
        role: rawUser.role,
      },
      email: rawUser.email!,
      poolId: userPoolId,
    });
  } else {
    await applicationContext.getUserGateway().createUser(applicationContext, {
      attributesToUpdate: {
        email: rawUser.email,
        name: rawUser.name,
        role: rawUser.role,
        userId,
      },
      email: rawUser.email!,
      poolId: userPoolId,
    });
  }

  if (user.role === ROLES.legacyJudge) {
    await applicationContext.getUserGateway().disableUser(applicationContext, {
      email: user.email!,
    });
  }

  await applicationContext.getCognito().adminSetUserPassword({
    Password: password,
    Permanent: true,
    UserPoolId: userPoolId,
    Username: user.email?.toLowerCase(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const applicationContext = createApplicationContext({});
  console.log('== Activating Admin Account');
  await activateAdminAccount();
  console.log('== Creating Court Users');
  await setupCourtUsers(applicationContext);
  console.log('== Creating Petitioners');
  await setupPetitioners();
  console.log('== Creating Practitioners');
  await setupPractitioners();
  console.log('== Deactivating Admin Account');
  await deactivateAdminAccount();
  console.log('== Done!');
})();
