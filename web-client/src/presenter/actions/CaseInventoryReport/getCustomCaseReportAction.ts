import {
  CHIEF_JUDGE,
  CUSTOM_CASE_REPORT_PAGE_SIZE,
} from '@shared/business/entities/EntityConstants';
import { state } from '@web-client/presenter/app.cerebral';

export const getCustomCaseReportAction = async ({
  applicationContext,
  get,
  props,
  store,
}: ActionProps<{ selectedPage: number }>) => {
  const filterValues = get(state.customCaseReport.filters);
  const currentJudges = get(state.judges);

  console.log('filterValues', filterValues);

  if (!filterValues.highPriority) {
    delete filterValues.highPriority;
  }

  let formattedStartDate: string | undefined;
  if (filterValues.startDate) {
    const [startMonth, startDay, startYear] = filterValues.startDate.split('/');
    formattedStartDate = applicationContext.getUtilities().createStartOfDayISO({
      day: startDay,
      month: startMonth,
      year: startYear,
    });
  }

  let formattedEndDate: string | undefined;
  if (filterValues.endDate) {
    const [endMonth, endDay, endYear] = filterValues.endDate.split('/');
    formattedEndDate = applicationContext
      .getUtilities()
      .createEndOfDayISO({ day: endDay, month: endMonth, year: endYear });
  }

  const lastIdsOfPages = get(state.customCaseReport.lastIdsOfPages);
  const searchAfter = lastIdsOfPages[props.selectedPage];

  console.log('filterValues.judges BEFORE', filterValues.judges);

  let formattedJudgesIds: string[] | undefined = [];
  if (filterValues.judges) {
    formattedJudgesIds = filterValues.judges.map(judgeName => {
      if (judgeName === CHIEF_JUDGE) return CHIEF_JUDGE;
      const foundJudge = currentJudges.find(
        judgeMeta => judgeMeta.name === judgeName,
      );
      return foundJudge!.userId;
    });
  }

  console.log('filterValues.judges AFTER', filterValues.judges);
  const reportData = await applicationContext
    .getUseCases()
    .getCustomCaseReportInteractor(applicationContext, {
      ...filterValues,
      endDate: formattedEndDate,
      judges: formattedJudgesIds,
      pageSize: CUSTOM_CASE_REPORT_PAGE_SIZE,
      searchAfter,
      startDate: formattedStartDate,
    });

  store.set(
    state.customCaseReport.lastIdsOfPages[props.selectedPage + 1],
    reportData.lastCaseId,
  );

  store.set(state.customCaseReport.cases, reportData.foundCases);
  store.set(state.customCaseReport.totalCases, reportData.totalCount);
};
