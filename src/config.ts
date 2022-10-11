export default {
  port: process.env.PORT || '3000',

  tempFolder: process.env.TEMP_FOLDER || '.tmp',

  storageFolder: process.env.FOLDER || '_storage',
  storageProvider: process.env.PROVIDER || 'local', // supported values: local, aws, gcp, az

  gcpKeyFileLocation:
    process.env.GCP_KEY_FILE_LOCATION ||
    '<PUT_YOUR_GCP_SERVICE_ACCOUNT_KEY_FILE_LOCATION>',
  gcpBucket: process.env.GCP_BUCKET || '<PUT_YOUR_GCP_BUCKET_NAME>',

  awsRegion: process.env.AWS_REGION || '<PUT-YOUR_AWS_REGION>',
  awsBucket: process.env.AWS_BUCKET || '<PUT_YOUR_AWS_BUCKET_NAME>',

  azStorageAccountName:
    process.env.AZ_STORAGE_ACCOUNT_NAME || '<PUT_YOUR_AZ_STORAGE_ACCOUNT_NAME>',
  azStorageAccountAccessKey:
    process.env.AZ_STORAGE_ACCOUNT_ACCESS_KEY ||
    '<PUT_YOUR_AZ_STORAGE_ACCOUNT_ACCESS_KEY>',
  azContainerName:
    process.env.AZ_CONTAINER || '<PUT_YOUR_AZ_STORAGE_CONTAINER>',

  rateLimit: {
    provider: process.env.RATE_LIMIT || 'in-memory', // supported values: in-memory, redis
    max: {
      uploads: Number(process.env.MAX_DAILY_UPLOADS || '5'),
      downloads: Number(process.env.MAX_DAILY_DOWNLOADS || '25')
    },
    redis: {
      url: process.env.REDIS_URI || '<PUT_YOUR_REDIS_URL>'
    }
  },

  garbageCollection: {
    cronExpression: process.env.GC_INACTIVE_CRON || '0 1 * * *', // Run every night @ 1am
    inactiveDuration: process.env.GC_INACTIVE_DURATION || '14d'
  }
};
