import { state } from '@web-client/presenter/app.cerebral';

export const setJudgeActivityReportDataAction = ({
  props,
  store,
}: ActionProps) => {
  const {
    cases: submittedAndCavCasesByJudge,
    casesClosedByJudge,
    consolidatedCasesGroupCountMap,
    totalCountForSubmittedAndCavCases,
    trialSessions,
  } = props;

  store.set(
    state.judgeActivityReport.judgeActivityReportData.casesClosedByJudge,
    casesClosedByJudge,
  );

  store.set(
    state.judgeActivityReport.judgeActivityReportData.trialSessions,
    trialSessions,
  );

  store.set(
    state.judgeActivityReport.judgeActivityReportData
      .consolidatedCasesGroupCountMap,
    consolidatedCasesGroupCountMap,
  );

  store.set(
    state.judgeActivityReport.judgeActivityReportData
      .submittedAndCavCasesByJudge,
    submittedAndCavCasesByJudge,
  );

  store.set(
    state.judgeActivityReport.judgeActivityReportData
      .totalCountForSubmittedAndCavCases,
    totalCountForSubmittedAndCavCases,
  );
};
