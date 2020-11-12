const {
  migrateTrialSessionInteractor,
} = require('./migrateTrialSessionInteractor');
const { applicationContext } = require('../test/createTestApplicationContext');
const { ROLES } = require('../entities/EntityConstants');
const { User } = require('../entities/User');

const DATE = '2018-11-21T20:49:28.192Z';

let adminUser;
let createdTrialSessions;
let trialSessionMetadata;

describe('migrateTrialSessionInteractor', () => {
  beforeEach(() => {
    window.Date.prototype.toISOString = jest.fn(() => DATE);

    adminUser = new User({
      name: 'Joe Exotic',
      role: ROLES.admin,
      userId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
    });

    createdTrialSessions = [];

    applicationContext.environment.stage = 'local';

    applicationContext.getCurrentUser.mockImplementation(() => adminUser);

    applicationContext
      .getUseCaseHelpers()
      .createTrialSessionAndWorkingCopy.mockImplementation(
        ({ trialSessionToCreate }) => {
          createdTrialSessions.push(trialSessionToCreate);
        },
      );

    applicationContext.getPersistenceGateway().getUserById.mockReturnValue({
      ...adminUser,
      section: 'admin',
    });

    applicationContext.getUseCases().getUserInteractor.mockReturnValue({
      name: 'john doe',
      userId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
    });

    trialSessionMetadata = {
      isCalendared: false,
      maxCases: 100,
      sessionType: 'Hybrid',
      startDate: DATE,
      term: 'Fall',
      termYear: '2018',
      trialLocation: 'Chicago, Illinois',
      trialSessionId: 'a54ba5a9-b37b-479d-9201-067ec6e335cc',
    };
  });

  it('should get the current user from applicationContext', async () => {
    await migrateTrialSessionInteractor({
      applicationContext,
      trialSessionMetadata,
    });

    expect(applicationContext.getCurrentUser).toHaveBeenCalled();
  });

  it('throws an error if the user is not valid or authorized', async () => {
    applicationContext.getCurrentUser.mockReturnValue({});

    await expect(
      migrateTrialSessionInteractor({
        applicationContext,
        trialSessionMetadata,
      }),
    ).rejects.toThrow('Unauthorized');
  });

  it('should pull the current user record from persistence', async () => {
    await migrateTrialSessionInteractor({
      applicationContext,
      trialSessionMetadata,
    });

    expect(
      applicationContext.getPersistenceGateway().getUserById,
    ).toHaveBeenCalled();
  });

  it('should create a trial session successfully', async () => {
    expect(createdTrialSessions.length).toEqual(0);

    await migrateTrialSessionInteractor({
      applicationContext,
      trialSessionMetadata,
    });

    expect(
      applicationContext.getUseCaseHelpers().createTrialSessionAndWorkingCopy,
    ).toHaveBeenCalled();
  });
});
