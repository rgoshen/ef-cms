import { state } from 'cerebral';

/**
 * sets default start and end date for case deadlines report to today's date
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @returns {object} the case deadlines
 */
export const setDefaultCaseDeadlinesReportDatesAction = async ({
  applicationContext,
  store,
}) => {
  const {
    day,
    month,
    year,
  } = applicationContext
    .getUtilities()
    .deconstructDate(applicationContext.getUtilities().createISODateString());
  const currentDateStart = applicationContext
    .getUtilities()
    .createStartOfDayISO({ day, month, year });
  const currentDateEnd = applicationContext
    .getUtilities()
    .createEndOfDayISO({ day, month, year });

  store.set(state.screenMetadata.filterStartDateState, currentDateStart);
  store.set(state.screenMetadata.filterEndDateState, currentDateEnd);
};
