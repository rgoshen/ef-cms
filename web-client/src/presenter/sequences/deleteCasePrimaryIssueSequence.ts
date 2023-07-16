import { clearModalStateAction } from '../actions/clearModalStateAction';
import { deleteCasePrimaryIssueInDBAction } from '../actions/CaseWorksheet/deleteCasePrimaryIssueInDBAction';
import { deleteCasePrimaryIssueInStateAction } from '../actions/CaseWorksheet/deleteCasePrimaryIssueInStateAction';
import { getCaseDocketNumberFromModal } from '../actions/CaseWorksheet/getCaseDocketNumberFromModal';
import { showProgressSequenceDecorator } from '../utilities/showProgressSequenceDecorator';

export const deleteCasePrimaryIssueSequence = showProgressSequenceDecorator([
  getCaseDocketNumberFromModal,
  deleteCasePrimaryIssueInStateAction,
  deleteCasePrimaryIssueInDBAction,
  clearModalStateAction,
]);
