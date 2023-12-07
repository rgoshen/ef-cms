import { clearErrorAlertsAction } from '../../actions/clearErrorAlertsAction';
import { clearScreenMetadataAction } from '../../actions/clearScreenMetadataAction';
import { closeMobileMenuAction } from '../../actions/closeMobileMenuAction';
import { getUsersInSectionAction } from '../../actions/getUsersInSectionAction';
import { gotoLoginSequence } from '@web-client/presenter/sequences/Public/goToLoginSequence';
import { isLoggedInAction } from '../../actions/isLoggedInAction';
import { resetJudgeActivityReportStateAction } from '../../actions/resetJudgeActivityReportStateAction';
import { setAllAndCurrentJudgesAction } from '../../actions/setAllAndCurrentJudgesAction';
import { setJudgeLastNameOnJudgeActivityReportAction } from '../../actions/JudgeActivityReport/setJudgeLastNameOnJudgeActivityReportAction';
import { setupCurrentPageAction } from '../../actions/setupCurrentPageAction';
import { startWebSocketConnectionSequenceDecorator } from '../../utilities/startWebSocketConnectionSequenceDecorator';
import { stopShowValidationAction } from '../../actions/stopShowValidationAction';

const gotoJudgeActivityReport = [
  setupCurrentPageAction('Interstitial'),
  closeMobileMenuAction,
  stopShowValidationAction,
  clearScreenMetadataAction,
  clearErrorAlertsAction,
  resetJudgeActivityReportStateAction,
  setJudgeLastNameOnJudgeActivityReportAction,
  getUsersInSectionAction({ section: 'judge' }),
  setAllAndCurrentJudgesAction,
  setupCurrentPageAction('JudgeActivityReport'),
];

export const gotoJudgeActivityReportSequence = [
  isLoggedInAction,
  {
    isLoggedIn: startWebSocketConnectionSequenceDecorator(
      gotoJudgeActivityReport,
    ),
    unauthorized: [gotoLoginSequence],
  },
];
