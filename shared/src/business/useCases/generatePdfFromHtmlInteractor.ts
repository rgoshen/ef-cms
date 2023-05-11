import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

/**
 * generatePdfFromHtmlInteractor
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.docketNumber the docket number of the case
 * @param {string} providers.contentHtml the html content for the pdf
 * @param {boolean} providers.displayHeaderFooter boolean to determine if the header and footer should be displayed
 * @returns {Buffer} the pdf as a binary buffer
 */
export const generatePdfFromHtmlInteractor = async (
  applicationContext: IApplicationContext,
  {
    contentHtml,
    displayHeaderFooter = true,
    docketNumber,
    footerHtml,
    headerHtml,
    overwriteFooter,
  }: {
    contentHtml: string;
    displayHeaderFooter: boolean;
    docketNumber: string;
    footerHtml: string;
    headerHtml: string;
    overwriteFooter: string;
  },
) => {
  // TODO: replace me
  const sendGenerateEvent = true;

  if (sendGenerateEvent) {
    const { currentColor, region, stage } = applicationContext.environment;
    const client = new LambdaClient({
      region,
    });
    const command = new InvokeCommand({
      FunctionName: `pdf_generator_${stage}_${currentColor}`,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(
        JSON.stringify({
          contentHtml,
          displayHeaderFooter,
          docketNumber,
          footerHtml,
          headerHtml,
          overwriteFooter,
        }),
      ),
    });
    const response = await client.send(command);
    return await applicationContext.getPersistenceGateway().getDocument({
      applicationContext,
      key: response.Payload as unknown as string,
      protocol: 'S3',
      useTempBucket: true,
    });

    // return new Uint8Array(binaryData);
  } else {
    const ret = await applicationContext
      .getUseCaseHelpers()
      .generatePdfFromHtmlHelper(applicationContext, {
        contentHtml,
        displayHeaderFooter,
        docketNumber,
        footerHtml,
        headerHtml,
        overwriteFooter,
      });
    console.log('ret', ret);
    console.log('ret', typeof ret);
    return ret;
  }
};
