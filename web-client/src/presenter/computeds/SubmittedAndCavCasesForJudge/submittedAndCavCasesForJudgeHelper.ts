import { state } from '@web-client/presenter/app.cerebral';

type ComputedSubmittedAndCavCase = RawCase & {
  consolidatedIconTooltipText: string;
  isLeadCase: boolean;
  inConsolidatedGroup: boolean;
  formattedCaseCount: number;
  daysElapsedSinceLastStatusChange: number;
  formattedSubmittedCavStatusChangedDate: string;
};
interface ISubmittedAndCavCasesForJudgeHelper {
  filteredSubmittedAndCavCasesByJudge: ComputedSubmittedAndCavCase[];
}

//TODO: fetch array of worksheets
// join them
export const submittedAndCavCasesForJudgeHelper = (
  get: any,
  applicationContext: IApplicationContext,
): ISubmittedAndCavCasesForJudgeHelper => {
  const { consolidatedCasesGroupCountMap, submittedAndCavCasesByJudge = [] } =
    get(state.judgeActivityReport.judgeActivityReportData);

  const { worksheets = [] } = get(state.submittedAndCavCases);
  const worksheetsObj = {};
  worksheets.forEach(ws => (worksheetsObj[ws.docketNumber] = ws));

  const currentDateInIsoFormat: string = applicationContext
    .getUtilities()
    .formatDateString(
      applicationContext.getUtilities().prepareDateFromString(),
      applicationContext.getConstants().DATE_FORMATS.ISO,
    );

  const getSubmittedOrCAVDate = (
    caseStatusHistory: { updatedCaseStatus: string; date: string }[],
  ): string => {
    const foundDate = caseStatusHistory.find(statusHistory =>
      ['Submitted', 'CAV'].includes(statusHistory.updatedCaseStatus),
    )?.date;
    if (!foundDate) return '';
    return applicationContext
      .getUtilities()
      .formatDateString(
        foundDate,
        applicationContext.getConstants().DATE_FORMATS.MMDDYY,
      );
  };

  const filteredSubmittedAndCavCasesByJudge =
    submittedAndCavCasesByJudge.filter(
      unfilteredCase => unfilteredCase.caseStatusHistory.length > 0,
    );

  // should we map here instead?
  filteredSubmittedAndCavCasesByJudge.forEach(aCase => {
    // TODO: figure out what changed - used to call .get on the object
    aCase.formattedCaseCount =
      consolidatedCasesGroupCountMap[aCase.docketNumber] || 1;
    if (aCase.leadDocketNumber === aCase.docketNumber) {
      aCase.consolidatedIconTooltipText = 'Lead case';
      aCase.isLeadCase = true;
      aCase.inConsolidatedGroup = true;
    }

    if (worksheetsObj[aCase.docketNumber]) {
      Object.entries(worksheetsObj[aCase.docketNumber]).forEach(
        ([key, value]) => (aCase[key] = value),
      );
    }

    aCase.formattedSubmittedCavStatusChangedDate = getSubmittedOrCAVDate(
      aCase.caseStatusHistory,
    );

    const newestCaseStatusChangeIndex = aCase.caseStatusHistory.length - 1;

    const dateOfLastCaseStatusChange =
      aCase.caseStatusHistory[newestCaseStatusChangeIndex].date;

    aCase.daysElapsedSinceLastStatusChange = applicationContext
      .getUtilities()
      .calculateDifferenceInDays(
        currentDateInIsoFormat,
        dateOfLastCaseStatusChange,
      );
  });

  filteredSubmittedAndCavCasesByJudge.sort((a, b) => {
    return (
      b.daysElapsedSinceLastStatusChange - a.daysElapsedSinceLastStatusChange
    );
  });

  return {
    filteredSubmittedAndCavCasesByJudge,
  };
};
