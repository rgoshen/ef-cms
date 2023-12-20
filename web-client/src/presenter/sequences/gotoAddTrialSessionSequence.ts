import { clearFormAction } from '../actions/clearFormAction';
import { clearScreenMetadataAction } from '../actions/clearScreenMetadataAction';
import { getSetJudgesSequence } from './getSetJudgesSequence';
import { getTrialSessionsAction } from '../actions/TrialSession/getTrialSessionsAction';
import { getUsersInSectionAction } from '../actions/getUsersInSectionAction';
import { parallel } from 'cerebral/factories';
import { setDefaultTrialSessionFormValuesAction } from '../actions/setDefaultTrialSessionFormValuesAction';
import { setTrialSessionsAction } from '../actions/TrialSession/setTrialSessionsAction';
import { setUsersByKeyAction } from '../actions/setUsersByKeyAction';
import { setupCurrentPageAction } from '../actions/setupCurrentPageAction';
import { startWebSocketConnectionSequenceDecorator } from '../utilities/startWebSocketConnectionSequenceDecorator';
import { stopShowValidationAction } from '../actions/stopShowValidationAction';

const gotoAddTrialSession = [
  setupCurrentPageAction('Interstitial'),
  stopShowValidationAction,
  clearFormAction,
  clearScreenMetadataAction,
  parallel([
    [getTrialSessionsAction, setTrialSessionsAction],
    getSetJudgesSequence,
    [
      getUsersInSectionAction({ section: 'trialClerks' }),
      setUsersByKeyAction('trialClerks'),
    ],
  ]),
  setDefaultTrialSessionFormValuesAction,
  setupCurrentPageAction('AddTrialSession'),
];

export const gotoAddTrialSessionSequence = [
  startWebSocketConnectionSequenceDecorator(gotoAddTrialSession),
];
