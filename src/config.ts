export default {
  port: process.env.PORT || '3000',
  storageFolder: process.env.FOLDER || '_storage',
  storageProvider: process.env.PROVIDER || 'local',
  gcpConfigFile: process.env.CONFIG,
  tempFolder: process.env.TEMP_FOLDER || '.tmp',
  gcpBucket: process.env.GCP_BUCKET || '<PUT_YOUR_GCP_BUCKET_NAME>',
  awsRegion: process.env.AWS_REGION || '<PUT-YOUR_AWS_REGION>',
  awsBucket: process.env.AWS_BUCKET || '<PUT_YOUR_AWS_BUCKET_NAME>',
  azStorageAccountName:
    process.env.AZ_STORAGE_ACCOUNT_NAME || '<PUT_YOUR_AZ_STORAGE_ACCOUNT_NAME>',
  azStorageAccountAccessKey:
    process.env.AZ_STORAGE_ACCOUNT_ACCESS_KEY ||
    '<PUT_YOUR_AZ_STORAGE_ACCOUNT_ACCESS_KEY>',
  azContainerName: process.env.AZ_CONTAINER || 'PUT_YOUR_AZ_STORAGE_CONTAINER',
  maxRateLimit: {
    uploads: parseInt(process.env.MAX_DAILY_UPLOADS || '5', 10),
    downloads: parseInt(process.env.MAX_DAILY_DOWNLOADS || '15', 10)
  },
  garbageCollection: {
    cronExpression: process.env.GC_INACTIVE_CRON || '0 1 * * *', // Run every night @ 1am
    inactiveDuration: process.env.GC_INACTIVE_DURATION || '15d'
  }
};
