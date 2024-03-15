import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { chunk } from 'lodash';
import { scanFull } from './utilities/scanFull';

const CHUNK_SIZE = 25;

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    'must provide a dynamodb table name to clear: [efcms-dev, efcms-dev-1]',
  );
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function () {
  const dynamoDbTableName = args[0];
  const dynamodb = new DynamoDBClient({
    maxAttempts: 10,
    region: 'us-east-1',
  });
  const documentClient = DynamoDBDocument.from(dynamodb, {
    marshallOptions: { removeUndefinedValues: true },
  });

  const items = await scanFull(dynamoDbTableName, documentClient);

  const chunks = chunk(items, CHUNK_SIZE);

  let count = 0;

  for (let c of chunks) {
    count += CHUNK_SIZE;
    console.log(`deleting chunk: ${count} total deleted`);

    await documentClient.batchWrite({
      RequestItems: {
        [dynamoDbTableName]: c.map(item => ({
          DeleteRequest: {
            Key: {
              pk: item.pk,
              sk: item.sk,
            },
          },
        })),
      },
    });
  }
})();
