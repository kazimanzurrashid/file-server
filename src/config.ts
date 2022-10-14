const setDefault = (defaultValue: string, ...envKeys: string[]): string => {
  for (const key of envKeys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return defaultValue;
};

export const isDefault = (value: string): boolean => {
  return !value || /^<PUT_YOUR_\w+>$/.test(value);
};

export default {
  port: setDefault('3002', 'PORT', 'FILE_SERVER_PORT'),

  rateLimit: {
    provider: setDefault('in-memory', 'RATE_LIMIT_PROVIDER'), // supported values: in-memory, redis

    max: {
      uploads: Number(setDefault('5', 'MAX_DAILY_UPLOADS')),
      downloads: Number(setDefault('25', 'MAX_DAILY_DOWNLOADS'))
    },

    redis: {
      uri: setDefault('<PUT_YOUR_REDIS_URI>', 'REDIS_URI', 'REDIS_URL')
    }
  },

  db: {
    provider: setDefault('in-memory', 'DB_PROVIDER'), // supported values: in-memory, mongo/mongodb

    mongodb: {
      uri: setDefault(
        '<PUT_YOUR_MONGODB_URI>',
        'MONGODB_URI',
        'MONGO_URI',
        'MONGODB_URL',
        'MONGO_URL'
      ),
      collection: setDefault('files', 'MONGODB_COLLECTION', 'MONGO_COLLECTION')
    }
  },

  storage: {
    tempLocation: setDefault(
      '.tmp',
      'STORAGE_TEMP_LOCATION',
      'STORAGE_TEMP_DIRECTORY',
      'STORAGE_TEMP_FOLDER'
    ),

    provider: setDefault('local', 'STORAGE_PROVIDER'), // supported values: local, gcp/google, aws/amazon, az/azure/microsoft

    local: {
      location: setDefault('_storage', 'LOCAL_STORAGE_LOCATION')
    },

    gcp: {
      keyFileLocation: setDefault(
        '<PUT_YOUR_GCP_SERVICE_ACCOUNT_KEY_FILE_LOCATION>',
        'GCP_KEY_FILE_LOCATION',
        'GCP_KEY_FILENAME'
      ),

      bucket: process.env.GCP_BUCKET || '<PUT_YOUR_GCP_BUCKET_NAME>'
    },

    aws: {
      accessKeyId: setDefault(
        '<PUT_YOUR_AWS_ACCESS_KEY_ID>',
        'AWS_ACCESS_KEY_ID'
      ),
      secretAccessKey: setDefault(
        '<PUT_YOUR_AWS_SECRET_ACCESS_KEY>',
        'AWS_SECRET_ACCESS_KEY'
      ),
      region: setDefault('<PUT_YOUR_AWS_REGION>', 'AWS_REGION'),
      bucket: setDefault('<PUT_YOUR_AWS_BUCKET_NAME>', 'AWS_BUCKET')
    },

    az: {
      storageAccountName: setDefault(
        '<PUT_YOUR_AZ_STORAGE_ACCOUNT_NAME>',
        'AZ_STORAGE_ACCOUNT_NAME'
      ),
      storageAccountAccessKey: setDefault(
        '<PUT_YOUR_AZ_STORAGE_ACCOUNT_ACCESS_KEY>',
        'AZ_STORAGE_ACCOUNT_ACCESS_KEY'
      ),
      storageContainer: setDefault(
        '<PUT_YOUR_AZ_STORAGE_CONTAINER>',
        'AZ_STORAGE_CONTAINER'
      )
    }
  },

  garbageCollection: {
    enabled: ['true', 'yes', 'y'].includes(setDefault('false', 'GC_ENABLED')),
    cronExpression: setDefault('0 1 * * *', 'GC_INACTIVE_CRON'), // Run every night @ 1am
    inactiveDuration: setDefault('14d', 'GC_INACTIVE_DURATION')
  },

  validate(): void {
    if (this.rateLimit.max.downloads < 1) {
      throw new Error(
        'Rate limit daily max downloads must be a positive integer'
      );
    }

    if (this.rateLimit.max.uploads < 1) {
      throw new Error(
        'Rate limit daily max uploads must be a positive integer'
      );
    }

    const supportedRateLimitProviders = 'redis,in-memory'.split(',');

    if (!supportedRateLimitProviders.includes(this.rateLimit.provider)) {
      throw new Error(
        `Unknown database provider! supported values are ${supportedRateLimitProviders.join(
          ', '
        )}.`
      );
    }

    if (this.rateLimit.provider === 'redis') {
      if (isDefault(this.rateLimit.redis.uri)) {
        throw new Error('Redis connection string must be set.');
      }
    }

    const mongoDB = ['mongo', 'mongodb'];

    const supportedDBProviders = [...mongoDB, 'in-memory'];

    if (!supportedDBProviders.includes(this.db.provider)) {
      throw new Error(
        `Unknown database provider! supported values are "${supportedDBProviders.join(
          ', '
        )}".`
      );
    }

    if (mongoDB.includes(this.db.provider)) {
      if (isDefault(this.db.mongodb.uri)) {
        throw new Error('MongoDB connection string must be set.');
      }

      if (isDefault(this.db.mongodb.collection)) {
        throw new Error('Mongodb collection must be set.');
      }
    }

    if (isDefault(this.storage.tempLocation)) {
      throw new Error('Storage temp location must be set.');
    }

    const gcp = 'gcp/google'.split('/');
    const aws = 'aws/amazon'.split('/');
    const az = 'az/azure/microsoft'.split('/');

    const supportedStorageProviders = [...gcp, ...aws, ...az, 'local'];

    if (!supportedStorageProviders.includes(this.storage.provider)) {
      throw new Error(
        `Unknown storage provider! supported values are ${supportedStorageProviders.join(
          ', '
        )}.`
      );
    }

    if (gcp.includes(this.storage.provider)) {
      if (isDefault(this.storage.gcp.keyFileLocation)) {
        throw new Error('GCP key file location must be set.');
      }

      if (isDefault(this.storage.gcp.bucket)) {
        throw new Error('GCP bucket must be set.');
      }
    } else if (aws.includes(this.storage.provider)) {
      if (isDefault(this.storage.aws.accessKeyId)) {
        throw new Error('AWS access key id must be set.');
      }

      if (isDefault(this.storage.aws.secretAccessKey)) {
        throw new Error('AWS secret access key must be set.');
      }

      if (isDefault(this.storage.aws.region)) {
        throw new Error('AWS region must be set.');
      }

      if (isDefault(this.storage.aws.bucket)) {
        throw new Error('AWS bucket must be set.');
      }
    } else if (az.includes(this.storage.provider)) {
      if (isDefault(this.storage.az.storageAccountName)) {
        throw new Error('AZ storage account name must be set.');
      }

      if (isDefault(this.storage.az.storageAccountAccessKey)) {
        throw new Error('AZ storage account access key must be set.');
      }

      if (isDefault(this.storage.az.storageContainer)) {
        throw new Error('AZ storage container name must be set.');
      }
    } else {
      if (isDefault(this.storage.local.location)) {
        throw new Error('Local storage location must be set.');
      }
    }

    if (this.garbageCollection.enabled) {
      if (isDefault(this.garbageCollection.cronExpression)) {
        throw new Error('Cannot unset garbage collection cron expression.');
      }

      if (isDefault(this.garbageCollection.inactiveDuration)) {
        throw new Error('Cannot unset garbage collection inactive duration.');
      }
    }
  }
};
