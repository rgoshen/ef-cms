import { Case } from '../../../../shared/src/business/entities/cases/Case';
import { User } from '../../../../shared/src/business/entities/User';
import { applicationContext } from '../../applicationContext';
import { caseInventoryReportHelper as caseInventoryReportHelperComputed } from './caseInventoryReportHelper';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../../withAppContext';

applicationContext.getCurrentUser = () => ({
  role: User.ROLES.docketClerk,
  userId: '5d66d122-8417-427b-9048-c1ba8ab1ea68',
});

const caseInventoryReportHelper = withAppContextDecorator(
  caseInventoryReportHelperComputed,
  {
    ...applicationContext,
  },
);

describe('caseInventoryReportHelper', () => {
  it('should return all case statuses', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        screenMetadata: {},
      },
    });

    expect(result.caseStatuses).toEqual(Object.values(Case.STATUS_TYPES));
  });

  it('should return all judges from state along with Chief Judge sorted alphabetically', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        judges: [
          { name: 'Joseph Dredd' },
          { name: 'Judith Blum' },
          { name: 'Roy Scream' },
        ],
        screenMetadata: {},
      },
    });

    expect(result.judges).toEqual([
      'Chief Judge',
      'Joseph Dredd',
      'Judith Blum',
      'Roy Scream',
    ]);
  });

  it('should return showJudgeColumn and showStatusColumn true if associatedJudge and status are not set on screenMetadata', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        screenMetadata: {},
      },
    });

    expect(result).toMatchObject({
      showJudgeColumn: true,
      showStatusColumn: true,
    });
  });

  it('should return showJudgeColumn and showStatusColumn false if associatedJudge and status are set on screenMetadata', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        screenMetadata: { associatedJudge: 'Chief Judge', status: 'New' },
      },
    });

    expect(result).toMatchObject({
      showJudgeColumn: false,
      showStatusColumn: false,
    });
  });

  it('should return a result count from caseInventoryReportData', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        caseInventoryReportData: {
          totalCount: '1',
        },
        screenMetadata: {},
      },
    });

    expect(result.resultCount).toEqual('1');
    expect(result.formattedReportData).toEqual([]);
  });

  it('should sort and format cases from caseInventoryReportData.foundCases', () => {
    const result = runCompute(caseInventoryReportHelper, {
      state: {
        caseInventoryReportData: {
          foundCases: [
            {
              docketNumber: '123-20',
            },
            {
              docketNumber: '123-19',
              docketNumberSuffix: 'L',
            },
            {
              docketNumber: '135-19',
            },
          ],
        },
        screenMetadata: {},
      },
    });

    expect(result.formattedReportData).toMatchObject([
      {
        docketNumberWithSuffix: '123-19L',
      },
      {
        docketNumberWithSuffix: '135-19',
      },
      {
        docketNumberWithSuffix: '123-20',
      },
    ]);
  });
});
