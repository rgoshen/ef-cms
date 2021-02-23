const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  ROLES,
  SERVICE_INDICATOR_TYPES,
} = require('../../entities/EntityConstants');
const { addNewUserToCase } = require('./addNewUserToCase');
const { Case } = require('../../entities/cases/Case');
const { MOCK_CASE } = require('../../../test/mockCase');

describe('addNewUserToCase', () => {
  const USER_ID = '674fdded-1d17-4081-b9fa-950abc677cee';

  beforeEach(() => {
    applicationContext.getUniqueId.mockReturnValue(USER_ID);
  });

  it('should throw an unauthorized error for non admissionsclerk users', async () => {
    applicationContext.getCurrentUser.mockReturnValue({});

    await expect(
      addNewUserToCase({
        applicationContext,
        caseEntity: new Case(MOCK_CASE, { applicationContext }),
        email: 'testing@example.com',
        name: 'Bob Ross',
      }),
    ).rejects.toThrow('Unauthorized');
  });

  it('should call createNewPetitionerUser with the new user entity', async () => {
    const UPDATED_EMAIL = 'testing@example.com';

    applicationContext.getCurrentUser.mockReturnValue({
      role: ROLES.admissionsClerk,
    });

    const caseEntity = new Case(
      {
        ...MOCK_CASE,
        contactPrimary: {
          ...MOCK_CASE.contactPrimary,
          contactId: '123',
          email: undefined,
          name: 'Bob Ross',
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
        },
      },
      { applicationContext },
    );

    await addNewUserToCase({
      applicationContext,
      caseEntity,
      email: UPDATED_EMAIL,
      name: 'Bob Ross',
    });

    expect(
      applicationContext.getPersistenceGateway().createNewPetitionerUser.mock
        .calls[0][0].user,
    ).toMatchObject({
      contact: {},
      email: UPDATED_EMAIL,
      name: 'Bob Ross',
      role: ROLES.petitioner,
      userId: USER_ID,
    });
  });

  it('should return the caseEntity', async () => {
    const UPDATED_EMAIL = 'testing@example.com';

    applicationContext.getCurrentUser.mockReturnValue({
      role: ROLES.admissionsClerk,
    });

    const caseEntity = new Case(
      {
        ...MOCK_CASE,
        contactPrimary: {
          ...MOCK_CASE.contactPrimary,
          contactId: '123',
          email: undefined,
          name: 'Bob Ross',
          serviceIndicator: SERVICE_INDICATOR_TYPES.SI_PAPER,
        },
      },
      { applicationContext },
    );

    const updatedCase = await addNewUserToCase({
      applicationContext,
      caseEntity,
      email: UPDATED_EMAIL,
      name: 'Bob Ross',
    });

    expect(updatedCase).toMatchObject(caseEntity);
  });
});
