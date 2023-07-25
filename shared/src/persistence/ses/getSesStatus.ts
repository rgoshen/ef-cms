import NodeCache from 'node-cache';

export const getSesStatus = async ({
  applicationContext,
}: {
  applicationContext: IApplicationContext;
}) => {
  const cache = new NodeCache({ checkperiod: 120, stdTTL: 300 });
  const cacheKey = 'SES_health';

  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    applicationContext.logger.info('Returning SES health status from cache');
    return cachedResponse;
  }

  const SES = applicationContext.getEmailClient();
  const HOURS_TO_MONITOR = 24;
  const { SendDataPoints } = await SES.getSendStatistics({}).promise();
  const numberOfDataPoints = HOURS_TO_MONITOR * 4; // each data point is a 15 minute increment
  const sesHealth = SendDataPoints.slice(0, numberOfDataPoints).every(
    ({ Rejects }) => Rejects === 0,
  );

  cache.set(cacheKey, sesHealth);

  applicationContext.logger.info(
    'Returning SES health status from SES service',
  );
  return sesHealth;
};
