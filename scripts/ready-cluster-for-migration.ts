import { ES } from 'aws-sdk';
import { elasticsearchIndexes } from '../web-api/elasticsearch/elasticsearch-indexes';
import { getClient } from '../web-api/elasticsearch/client';

if (!process.argv[2]) {
  throw new Error('Please provide an Opensearch Domain to check');
}

(async () => {
  // check the domain
  const es: ES = new ES({ region: 'us-east-1' });
  const DomainName: string = process.argv[2];
  const [, , ENV, VERSION]: string[] = DomainName.split('-');

  try {
    await es
      .describeElasticsearchDomain({
        DomainName,
      })
      .promise();
  } catch (err: any) {
    if (err.code === 'ResourceNotFoundException') {
      console.log('cluster does not exist');
      return;
    }
    throw err;
  }

  const client = await getClient({ environmentName: ENV, version: VERSION });
  const res = await client.count({
    body: {
      query: {
        match_all: {},
      },
    },
  });

  // get the count for the domain
  if (res.body.count > 0) {
    console.log('cluster is NOT empty, exiting with status code 1');
    process.exit(1);
  }

  // if the cluster is empty, just delete the indices as they will be recreated soon
  // with latest and greatest mappings
  await Promise.all(
    elasticsearchIndexes.map(index => {
      client.indices.delete({ body: {}, index });
    }),
  );
})();
