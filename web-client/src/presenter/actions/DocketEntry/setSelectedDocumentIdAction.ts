import { DownloadDocketEntryRequestType } from '@shared/business/useCases/document/batchDownloadDocketEntriesInteractor';
import { isEqual } from 'lodash';
import { state } from '@web-client/presenter/app.cerebral';

export type SelectedDocumentInfoType = Pick<
  DownloadDocketEntryRequestType,
  'caseCaption' | 'docketEntries' | 'docketNumber' | 'isSealed'
>;

export const setSelectedDocumentIdAction = ({
  get,
  props,
  store,
}: ActionProps<SelectedDocumentInfoType>) => {
  const { docketEntries } = props;
  const documentsSelectedForDownload = get(state.documentsSelectedForDownload);

  const allDocumentsSelected = docketEntries.length > 1;
  const singleDocumentSelected = docketEntries.length === 1;

  if (allDocumentsSelected) {
    if (isEqual(docketEntries, documentsSelectedForDownload)) {
      store.set(state.documentsSelectedForDownload, []);
    } else {
      store.set(state.documentsSelectedForDownload, docketEntries);
    }
  } else if (singleDocumentSelected) {
    const document = docketEntries[0];
    const index = documentsSelectedForDownload.findIndex(
      doc => doc.docketEntryId === document.docketEntryId,
    );

    if (index !== -1) {
      documentsSelectedForDownload.splice(index, 1);
    } else {
      documentsSelectedForDownload.push(document);
    }

    store.set(state.documentsSelectedForDownload, documentsSelectedForDownload);
  }
};
