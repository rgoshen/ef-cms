const config = require('./webpack.config.lambda');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  ...config,
  entry: {
    migration: './web-api/migration-terraform/main/lambdas/migration.js',
    'migration-segments':
      './web-api/migration-terraform/main/lambdas/migration-segments.js',
  },
  externals: ['aws-sdk'],
  output: {
    clean: true,
    libraryTarget: 'umd',
    path: __dirname + '/web-api/migration-terraform/main/lambdas/dist',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './shared/admin-tools/elasticsearch/check-reindex-complete.js',
          to: '.',
        },
      ],
    }),
  ],
};
