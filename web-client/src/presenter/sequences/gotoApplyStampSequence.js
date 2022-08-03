import { clearFormAction } from '../actions/clearFormAction';
import { clearPDFStampDataAction } from '../actions/StampMotion/clearPDFStampDataAction';
import { getCaseAction } from '../actions/getCaseAction';
import { isLoggedInAction } from '../actions/isLoggedInAction';
import { redirectToCognitoAction } from '../actions/redirectToCognitoAction';
import { setCaseAction } from '../actions/setCaseAction';
import { setCurrentPageAction } from '../actions/setCurrentPageAction';
import { setDocketEntryIdAction } from '../actions/setDocketEntryIdAction';
import { setPDFForStampAction } from '../actions/setPDFForStampAction';
import { setPDFPageForSigningAction } from '../actions/setPDFPageForSigningAction';
import { setSignatureNameForPdfSigningAction } from '../actions/setSignatureNameForPdfSigningAction';
import { setViewerDocumentToDisplayAction } from '../actions/setViewerDocumentToDisplayAction';
import { startWebSocketConnectionSequenceDecorator } from '../utilities/startWebSocketConnectionSequenceDecorator';

export const goToApplyStampSequence = [
  isLoggedInAction,
  {
    isLoggedIn: startWebSocketConnectionSequenceDecorator([
      setCurrentPageAction('Interstitial'),
      getCaseAction,
      setCaseAction,
      setDocketEntryIdAction,
      // TODO: add action to set viewerDocumentToDisplay in props
      setViewerDocumentToDisplayAction,
      clearPDFStampDataAction,
      clearFormAction,
      setSignatureNameForPdfSigningAction,
      setPDFForStampAction,
      setPDFPageForSigningAction,
      setCurrentPageAction('ApplyStamp'),
    ]),
    unauthorized: [redirectToCognitoAction],
  },
];
