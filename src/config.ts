function setDefault(defaultValue: string, ...envKeys: string[]): string {
  for (const key of envKeys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return defaultValue;
}

export function isDefault(value: string): boolean {
  return !value || /^<PUT_YOUR_\w+>$/.test(value);
}

const config = {
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
    validateCache(this);
    validateDB(this);
    validateStorage(this);
    validateGC(this);
  }
};

function validateCache(cfg: typeof config): void {
  if (cfg.rateLimit.max.downloads < 1) {
    throw new Error(
      'Rate limit daily max downloads must be a positive integer'
    );
  }

  if (cfg.rateLimit.max.uploads < 1) {
    throw new Error('Rate limit daily max uploads must be a positive integer');
  }

  const supportedRateLimitProviders = 'redis,in-memory'.split(',');

  if (!supportedRateLimitProviders.includes(cfg.rateLimit.provider)) {
    throw new Error(
      `Unknown database provider! supported values are ${supportedRateLimitProviders.join(
        ', '
      )}.`
    );
  }

  if (cfg.rateLimit.provider === 'redis') {
    if (isDefault(cfg.rateLimit.redis.uri)) {
      throw new Error('Redis connection string must be set.');
    }
  }
}

function validateDB(cfg: typeof config): void {
  const mongoDB = ['mongo', 'mongodb'];

  const supportedDBProviders = [...mongoDB, 'in-memory'];

  if (!supportedDBProviders.includes(cfg.db.provider)) {
    throw new Error(
      `Unknown database provider! supported values are "${supportedDBProviders.join(
        ', '
      )}".`
    );
  }

  if (mongoDB.includes(cfg.db.provider)) {
    if (isDefault(cfg.db.mongodb.uri)) {
      throw new Error('MongoDB connection string must be set.');
    }

    if (isDefault(cfg.db.mongodb.collection)) {
      throw new Error('Mongodb collection must be set.');
    }
  }
}

function validateStorage(cfg: typeof config): void {
  if (isDefault(cfg.storage.tempLocation)) {
    throw new Error('Storage temp location must be set.');
  }

  const gcp = 'gcp/google'.split('/');
  const aws = 'aws/amazon'.split('/');
  const az = 'az/azure/microsoft'.split('/');

  const supportedStorageProviders = [...gcp, ...aws, ...az, 'local'];

  if (!supportedStorageProviders.includes(cfg.storage.provider)) {
    throw new Error(
      `Unknown storage provider! supported values are ${supportedStorageProviders.join(
        ', '
      )}.`
    );
  }

  if (gcp.includes(cfg.storage.provider)) {
    if (isDefault(cfg.storage.gcp.keyFileLocation)) {
      throw new Error('GCP key file location must be set.');
    }

    if (isDefault(cfg.storage.gcp.bucket)) {
      throw new Error('GCP bucket must be set.');
    }
  } else if (aws.includes(cfg.storage.provider)) {
    if (isDefault(cfg.storage.aws.accessKeyId)) {
      throw new Error('AWS access key id must be set.');
    }

    if (isDefault(cfg.storage.aws.secretAccessKey)) {
      throw new Error('AWS secret access key must be set.');
    }

    if (isDefault(cfg.storage.aws.region)) {
      throw new Error('AWS region must be set.');
    }

    if (isDefault(cfg.storage.aws.bucket)) {
      throw new Error('AWS bucket must be set.');
    }
  } else if (az.includes(cfg.storage.provider)) {
    if (isDefault(cfg.storage.az.storageAccountName)) {
      throw new Error('AZ storage account name must be set.');
    }

    if (isDefault(cfg.storage.az.storageAccountAccessKey)) {
      throw new Error('AZ storage account access key must be set.');
    }

    if (isDefault(cfg.storage.az.storageContainer)) {
      throw new Error('AZ storage container name must be set.');
    }
  } else {
    if (isDefault(cfg.storage.local.location)) {
      throw new Error('Local storage location must be set.');
    }
  }
}

function validateGC(cfg: typeof config): void {
  if (!cfg.garbageCollection.enabled) {
    return;
  }

  if (isDefault(cfg.garbageCollection.cronExpression)) {
    throw new Error('Cannot unset garbage collection cron expression.');
  }

  if (isDefault(cfg.garbageCollection.inactiveDuration)) {
    throw new Error('Cannot unset garbage collection inactive duration.');
  }
}

export default config;
