import { generateTrialCalendarPdfUrlAction } from '../actions/TrialSession/generateTrialCalendarPdfUrlAction';
import { gotoPrintTrialCalendarPreviewAction } from '../actions/gotoPrintTrialCalendarPreviewAction';
import { setPdfPreviewUrlSequence } from './setPdfPreviewUrlSequence';
import { showProgressSequenceDecorator } from '../utilities/sequenceHelpers';

export const printTrialCalendarSequence = showProgressSequenceDecorator([
  generateTrialCalendarPdfUrlAction,
  setPdfPreviewUrlSequence,
  gotoPrintTrialCalendarPreviewAction,
]);
