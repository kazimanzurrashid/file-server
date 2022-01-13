export default {
  port: process.env.PORT || '3000',
  storageFolder: process.env.FOLDER || '_storage',
  storageProvider: process.env.PROVIDER || 'local',
  gcpConfigFile: process.env.CONFIG,
  tempFolder: process.env.TEMP_FOLDER || '.tmp',
  gcpBucket: process.env.GCP_BUCKET || 'a-dummy-bucket',
  maxRateLimit: {
    uploads: parseInt(process.env.MAX_DAILY_UPLOADS || '5', 10),
    downloads: parseInt(process.env.MAX_DAILY_DOWNLOADS || '15', 10)
  },
  garbageCollection: {
    interval: parseInt(process.env.GC_INTERVAL|| '86400000', 10), // 1 day
    inactiveDuration: parseInt(process.env.GC_INACTIVE_DURATION|| '1296000000', 10), // 15 days
  }
};
