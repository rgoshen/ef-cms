import { FileUploadProgressMapType } from '@shared/business/entities/EntityConstants';
import { PaperCaseDataType } from '@shared/business/useCases/filePetitionInteractor';
import { state } from '@web-client/presenter/app.cerebral';

export const createCaseFromPaperAction = async ({
  applicationContext,
  get,
  path,
  props,
}: ActionProps<{
  fileUploadProgressMap: FileUploadProgressMapType;
}>) => {
  const petitionMetadata: PaperCaseDataType = get(state.form);
  const { fileUploadProgressMap } = props;
  let caseDetail: RawCase;
  const {
    applicationForWaiverOfFilingFeeFileId,
    attachmentToPetitionFileId,
    corporateDisclosureFileId,
    petitionFileId,
    requestForPlaceOfTrialFileId,
    stinFileId,
  } = await applicationContext
    .getUseCases()
    .filePetitionInteractor(applicationContext, {
      applicationForWaiverOfFilingFeeUploadProgress:
        fileUploadProgressMap.applicationForWaiverOfFilingFee,
      attachmentToPetitionUploadProgress:
        fileUploadProgressMap.attachmentToPetition,
      corporateDisclosureUploadProgress:
        fileUploadProgressMap.corporateDisclosure,
      petitionUploadProgress: fileUploadProgressMap.petition,
      requestForPlaceOfTrialUploadProgress:
        fileUploadProgressMap.requestForPlaceOfTrial,
      stinUploadProgress: fileUploadProgressMap.stin,
    });

  try {
    caseDetail = await applicationContext
      .getUseCases()
      .createCaseFromPaperInteractor(applicationContext, {
        applicationForWaiverOfFilingFeeFileId,
        attachmentToPetitionFileId,
        corporateDisclosureFileId,
        petitionFileId,
        petitionMetadata,
        requestForPlaceOfTrialFileId,
        stinFileId,
      });
  } catch (err) {
    return path.error();
  }

  return path.success({
    caseDetail,
  });
};
