import * as Process from 'process';

export default {
  port: process.env.PORT || '3002',

  rateLimit: {
    provider: process.env.RATE_LIMIT_PROVIDER || 'in-memory', // supported values: in-memory/local, redis
    max: {
      uploads: Number(process.env.MAX_DAILY_UPLOADS || '5'),
      downloads: Number(process.env.MAX_DAILY_DOWNLOADS || '25')
    },
    redis: {
      url: process.env.REDIS_URL || '<PUT_YOUR_REDIS_URL>'
    }
  },

  db: {
    provider: process.env.DB_PROVIDER || 'in-memory', // supported values: in-memory/local, mongo/mongodb
    mongodb: {
      url:
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        '<PUT_YOUR_MONGODB_URI>',
      collection:
        process.env.MONGO_COLLECTION ||
        process.env.MONGODB_COLLECTION ||
        'files'
    }
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // supported values: local, gcp/google, aws/amazon, az/azure/microsoft

    tempLocation: process.env.STORAGE_TEMP_LOCATION || '.tmp',

    local: {
      location: process.env.LOCAL_STORAGE_LOCATION || '_storage'
    },

    gcp: {
      keyFileLocation:
        process.env.GCP_KEY_FILE_LOCATION ||
        '<PUT_YOUR_GCP_SERVICE_ACCOUNT_KEY_FILE_LOCATION>',

      bucket: process.env.GCP_BUCKET || '<PUT_YOUR_GCP_BUCKET_NAME>'
    },

    aws: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID || '<PUT_YOUR_AWS_ACCESS_KEY_ID>',
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY || '<PUT_AWS_SECRET_ACCESS_KEY>',
      region: process.env.AWS_REGION || '<PUT_YOUR_AWS_REGION>',
      bucket: process.env.AWS_BUCKET || '<PUT_YOUR_AWS_BUCKET_NAME>'
    },

    az: {
      storageAccountName:
        process.env.AZ_STORAGE_ACCOUNT_NAME ||
        '<PUT_YOUR_AZ_STORAGE_ACCOUNT_NAME>',
      storageAccountAccessKey:
        process.env.AZ_STORAGE_ACCOUNT_ACCESS_KEY ||
        '<PUT_YOUR_AZ_STORAGE_ACCOUNT_ACCESS_KEY>',
      storageContainerName:
        process.env.AZ_CONTAINER || '<PUT_YOUR_AZ_STORAGE_CONTAINER>'
    }
  },

  garbageCollection: {
    enabled: ['true', 'yes', 'y'].includes(Process.env.GC_ENABLED || 'true'),
    cronExpression: process.env.GC_INACTIVE_CRON || '0 1 * * *', // Run every night @ 1am
    inactiveDuration: process.env.GC_INACTIVE_DURATION || '14d'
  }
};
