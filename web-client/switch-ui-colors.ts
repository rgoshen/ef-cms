import {
  ChangeResourceRecordSetsCommand,
  ListHostedZonesByNameCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';
import {
  CloudFrontClient,
  GetDistributionConfigCommand,
  ListDistributionsCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { requireEnvVars } from '../shared/admin-tools/util';

requireEnvVars([
  'CURRENT_COLOR',
  'DEPLOYING_COLOR',
  'EFCMS_DOMAIN',
  'ZONE_NAME',
]);

const { CURRENT_COLOR, DEPLOYING_COLOR, EFCMS_DOMAIN, ZONE_NAME } = process.env;

const cloudfront = new CloudFrontClient({ maxAttempts: 4 });
const route53 = new Route53Client();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const { DistributionList } = await cloudfront.send(
    new ListDistributionsCommand({}),
  );
  const distributions =
    DistributionList && 'Items' in DistributionList && DistributionList.Items
      ? DistributionList.Items
      : [];
  const updateDistributionCommands: UpdateDistributionCommand[] = [];
  let DNSName = '';

  const currentColorDistribution = distributions.find(distribution =>
    distribution.Aliases?.Items?.find(
      alias => alias === `app-${CURRENT_COLOR}.${EFCMS_DOMAIN}`,
    ),
  );
  if (currentColorDistribution?.Id) {
    const currentColorConfig = await cloudfront.send(
      new GetDistributionConfigCommand({
        Id: currentColorDistribution.Id,
      }),
    );
    if (currentColorConfig.DistributionConfig?.Aliases) {
      currentColorConfig.DistributionConfig.Aliases.Items = [
        `app-${CURRENT_COLOR}.${EFCMS_DOMAIN}`,
      ];
      currentColorConfig.DistributionConfig.Aliases.Quantity = 1;
    }
    updateDistributionCommands.push(
      new UpdateDistributionCommand({
        DistributionConfig: currentColorConfig.DistributionConfig,
        Id: currentColorDistribution.Id,
        IfMatch: currentColorConfig.ETag,
      }),
    );
  }

  const deployingColorDistribution = distributions.find(distribution =>
    distribution.Aliases?.Items?.find(
      alias => alias === `app-${DEPLOYING_COLOR}.${EFCMS_DOMAIN}`,
    ),
  );
  if (deployingColorDistribution?.Id) {
    const deployingColorConfig = await cloudfront.send(
      new GetDistributionConfigCommand({
        Id: deployingColorDistribution.Id,
      }),
    );
    if (deployingColorConfig.DistributionConfig?.Aliases) {
      deployingColorConfig.DistributionConfig.Aliases.Quantity = 2;
      deployingColorConfig.DistributionConfig.Aliases.Items = [
        `app-${DEPLOYING_COLOR}.${EFCMS_DOMAIN}`,
        `app.${EFCMS_DOMAIN}`,
      ];
    }
    if (deployingColorDistribution.DomainName) {
      DNSName = deployingColorDistribution.DomainName;
    }
    updateDistributionCommands.push(
      new UpdateDistributionCommand({
        DistributionConfig: deployingColorConfig.DistributionConfig,
        Id: deployingColorDistribution.Id,
        IfMatch: deployingColorConfig.ETag,
      }),
    );
  }

  for (const updateDistributionCommand of updateDistributionCommands) {
    try {
      await cloudfront.send(updateDistributionCommand);
    } catch (e) {
      // Need to retry after one minute as throttling occurs after the previous update request.
      setTimeout(async () => {
        await cloudfront.send(updateDistributionCommand);
      }, 60000);
    }
  }

  const zone = await route53.send(
    new ListHostedZonesByNameCommand({ DNSName: `${ZONE_NAME}.` }),
  );

  if (
    DNSName &&
    zone &&
    'HostedZones' in zone &&
    zone.HostedZones &&
    zone.HostedZones[0] &&
    'Id' in zone.HostedZones[0]
  ) {
    const HostedZoneId = zone.HostedZones[0].Id;
    await route53.send(
      new ChangeResourceRecordSetsCommand({
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: 'Z2FDTNDATAQYW2', // this magic number is the zone for all cloud front distributions on AWS
                },
                Name: `app.${EFCMS_DOMAIN}`,
                Type: 'A',
              },
            },
          ],
          Comment: `The UI for app.${EFCMS_DOMAIN}`,
        },
        HostedZoneId,
      }),
    );
  }
})();
