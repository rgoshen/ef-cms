import { TRIAL_SESSION_SCOPE_TYPES } from '../../../../shared/src/business/entities/EntityConstants';
import { isEmpty, isEqual } from 'lodash';

import { state } from 'cerebral';

export const formattedTrialSessionDetails = (get, applicationContext) => {
  const formattedTrialSession = applicationContext
    .getUtilities()
    .formattedTrialSessionDetails({
      applicationContext,
      trialSession: get(state.trialSession),
    });

  if (formattedTrialSession) {
    const { DATE_FORMATS, SESSION_STATUS_GROUPS } =
      applicationContext.getConstants();

    formattedTrialSession.showOpenCases =
      formattedTrialSession.computedStatus === SESSION_STATUS_GROUPS.open;
    formattedTrialSession.showOnlyClosedCases =
      formattedTrialSession.computedStatus === SESSION_STATUS_GROUPS.closed;

    if (formattedTrialSession.chambersPhoneNumber) {
      formattedTrialSession.chambersPhoneNumber = applicationContext
        .getUtilities()
        .formatPhoneNumber(formattedTrialSession.chambersPhoneNumber);
    }

    if (formattedTrialSession.startDate) {
      const trialDateFormatted = applicationContext
        .getUtilities()
        .formatDateString(formattedTrialSession.startDate);
      const nowDateFormatted = applicationContext
        .getUtilities()
        .formatNow(DATE_FORMATS.YYYYMMDD);
      const trialDateInFuture = trialDateFormatted > nowDateFormatted;
      formattedTrialSession.canDelete =
        trialDateInFuture && !formattedTrialSession.isCalendared;
      formattedTrialSession.canEdit =
        trialDateInFuture &&
        formattedTrialSession.computedStatus !== SESSION_STATUS_GROUPS.closed;

      const allCases = formattedTrialSession.caseOrder || [];
      const inactiveCases = allCases.filter(
        sessionCase => sessionCase.removedFromTrial === true,
      );

      if (
        (isEmpty(allCases) || isEqual(allCases, inactiveCases)) &&
        !trialDateInFuture &&
        formattedTrialSession.sessionScope ===
          TRIAL_SESSION_SCOPE_TYPES.standaloneRemote &&
        formattedTrialSession.isClosed !== SESSION_STATUS_GROUPS.closed
      ) {
        formattedTrialSession.canClose = true;
      }
    }
  }

  return formattedTrialSession;
};
