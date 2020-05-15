const { getS3 } = require('./getS3');
const { getS3Buckets } = require('./getS3Buckets');

exports.deleteS3Buckets = async ({ environment }) => {
  const s3 = getS3({ environment });

  const buckets = await getS3Buckets({
    environment,
    s3,
  });

  for (const bucket of buckets) {
    console.log('Deleting items from', bucket.Name);

    const objects = await s3
      .listObjects({ Bucket: bucket.Name, MaxKeys: 1000 })
      .promise();

    if (objects.Contents.length > 0) {
      await s3
        .deleteObjects({
          Bucket: bucket.Name,
          Delete: {
            Objects: objects.Contents.map(object => {
              return { Key: object.Key };
            }),
          },
        })
        .promise();

      console.log('Deleted objects:', objects.Contents.length);
    }

    const objectVersions = await s3
      .listObjectVersions({ Bucket: bucket.Name, MaxKeys: 1000 })
      .promise();

    if (objectVersions.Versions.length > 0) {
      await s3
        .deleteObjects({
          Bucket: bucket.Name,
          Delete: {
            Objects: objectVersions.Versions.map(objectVersion => {
              return {
                Key: objectVersion.Key,
                VersionId: objectVersion.VersionId,
              };
            }),
          },
        })
        .promise();
      console.log('Deleted versions:', objectVersions.Versions.length);
    }

    await s3.deleteBucket({ Bucket: bucket.Name }).promise();

    console.log('Deleted bucket:', bucket.Name);
  }
};
