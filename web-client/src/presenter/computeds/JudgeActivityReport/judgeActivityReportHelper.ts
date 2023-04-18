import { state } from 'cerebral';

export const judgeActivityReportHelper = get => {
  const { casesClosedByJudge, opinions, orders, trialSessions } = get(
    state.judgeActivityReportData,
  );

  let showDateRangeMessage = false;

  let closedCasesTotal,
    trialSessionsHeldTotal,
    opinionsFiledTotal,
    ordersFiledTotal;
  const hasFormBeenSubmitted =
    casesClosedByJudge && opinions && orders && trialSessions;

  console.log('hasFormBeenSubmitted', hasFormBeenSubmitted);

  if (hasFormBeenSubmitted) {
    closedCasesTotal = Object.values(casesClosedByJudge).reduce(
      (a: number, b: number) => a + b,
      0,
    );

    trialSessionsHeldTotal = Object.values(trialSessions).reduce(
      (a: number, b: number) => a + b,
      0,
    );

    opinionsFiledTotal = opinions.reduce((a: any, b: any) => a + b.count, 0);

    ordersFiledTotal = orders.reduce((a: any, b: any) => a + b.count, 0);
  } else {
    showDateRangeMessage = true;
  }

  const resultsCount =
    ordersFiledTotal +
    opinionsFiledTotal +
    trialSessionsHeldTotal +
    closedCasesTotal;

  const showResults = resultsCount > 0;

  return {
    closedCasesTotal,
    opinionsFiledTotal,
    ordersFiledTotal,
    showDateRangeMessage,
    showResults,
    trialSessionsHeldTotal,
  };
};
