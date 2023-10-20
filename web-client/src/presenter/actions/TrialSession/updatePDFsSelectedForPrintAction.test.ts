import { runAction } from '@web-client/presenter/test.cerebral';
import { updatePDFsSelectedForPrintAction } from './updatePDFsSelectedForPrintAction';

describe('updatePDFsSelectedForPrintAction', () => {
  const mockFileId = '2f28238c-8430-49e8-8a3c-f161fc691377';

  it('should add the provided key to the list of selected pdfs when it is NOT already in the list', async () => {
    const { state } = await runAction(updatePDFsSelectedForPrintAction, {
      props: {
        key: mockFileId,
      },
      state: {
        modal: {
          form: {
            selectedPdfs: [],
          },
        },
      },
    });

    expect(state.modal!.form!.selectedPdfs).toEqual([mockFileId]);
  });

  it('should remove the provided key from the list of selected pdfs when it is already in the list', async () => {
    const { state } = await runAction(updatePDFsSelectedForPrintAction, {
      props: {
        key: mockFileId,
      },
      state: {
        modal: {
          form: {
            selectedPdfs: [mockFileId],
          },
        },
      },
    });

    expect(state.modal!.form!.selectedPdfs).toEqual([]);
  });
});
