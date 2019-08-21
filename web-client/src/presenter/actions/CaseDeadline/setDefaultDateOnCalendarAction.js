import { state } from 'cerebral';

/**
 * sets the state.allCaseDeadlines
 *
 * @param {object} providers the providers object
 * @param {object} providers.props the cerebral props object containing the props.caseDeadlines
 * @param {object} providers.store the cerebral store used for setting the state.allCaseDeadlines
 */
export const setDefaultDateOnCalendarAction = ({ store }) => {
  const todaysDate = new Date();
  store.set(state.calendarStartDate, todaysDate);
};
