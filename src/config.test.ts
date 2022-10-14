import config, { isDefault } from './config';

describe('config', () => {
  describe('default values', () => {
    it('port is 3002', () => {
      expect(config.port).toEqual('3002');
    });

    it('rate limit provider is in-memory', () => {
      expect(config.rateLimit.provider).toEqual('in-memory');
    });

    it('rate limit daily max uploads is 5', () => {
      expect(config.rateLimit.max.uploads).toEqual(5);
    });

    it('rate limit daily max downloads is 25', () => {
      expect(config.rateLimit.max.downloads).toEqual(25);
    });

    it('redis uri is set to put instruction', () => {
      expect(isDefault(config.rateLimit.redis.uri)).toEqual(true);
    });

    it('db provider is in-memory', () => {
      expect(config.db.provider).toEqual('in-memory');
    });

    it('mongodb uri is set to put instruction', () => {
      expect(isDefault(config.db.mongodb.uri)).toEqual(true);
    });

    it('storage temp location is .tmp', () => {
      expect(config.storage.tempLocation).toEqual('.tmp');
    });

    it('storage provider is local', () => {
      expect(config.storage.provider).toEqual('local');
    });

    it('local storage location is _storage', () => {
      expect(config.storage.local.location).toEqual('_storage');
    });

    it('gcp key file location is set to put instruction', () => {
      expect(isDefault(config.storage.gcp.keyFileLocation)).toEqual(true);
    });

    it('gcp bucket is set to put instruction', () => {
      expect(isDefault(config.storage.gcp.bucket)).toEqual(true);
    });

    it('aws access key id is set to put instruction', () => {
      expect(isDefault(config.storage.aws.accessKeyId)).toEqual(true);
    });

    it('aws secret access key is set to put instruction', () => {
      expect(isDefault(config.storage.aws.secretAccessKey)).toEqual(true);
    });

    it('aws region is set to put instruction', () => {
      expect(isDefault(config.storage.aws.region)).toEqual(true);
    });

    it('aws bucket is set to put instruction', () => {
      expect(isDefault(config.storage.aws.bucket)).toEqual(true);
    });

    it('az storage account name is set to put instruction', () => {
      expect(isDefault(config.storage.az.storageAccountName)).toEqual(true);
    });

    it('az storage account access key is set to put instruction', () => {
      expect(isDefault(config.storage.az.storageAccountAccessKey)).toEqual(
        true
      );
    });

    it('az storage container is set to put instruction', () => {
      expect(isDefault(config.storage.az.storageContainer)).toEqual(true);
    });

    it('garbage collection disabled', () => {
      expect(config.garbageCollection.enabled).toEqual(false);
    });

    it('garbage collection cron expression has some value', () => {
      expect(isDefault(config.garbageCollection.cronExpression)).toEqual(false);
    });

    it('garbage collection inactive duration has some value', () => {
      expect(isDefault(config.garbageCollection.inactiveDuration)).toEqual(
        false
      );
    });
  });

  describe('validate', () => {
    it('does not throw with default values', () => {
      expect(() => config.validate()).not.toThrow();
    });

    it('throws when rate limit daily max uploads is not positive integer', () => {
      const current = config.rateLimit.max.uploads;
      config.rateLimit.max.uploads = 0;

      expect(() => config.validate()).toThrow();

      config.rateLimit.max.uploads = current;
    });

    it('throws when rate limit daily max downloads is not positive integer', () => {
      const current = config.rateLimit.max.downloads;
      config.rateLimit.max.downloads = 0;

      expect(() => config.validate()).toThrow();

      config.rateLimit.max.downloads = current;
    });

    it('throws when rate limit provider is unknown', () => {
      const current = config.rateLimit.provider;
      config.rateLimit.provider = 'foo-bar';

      expect(() => config.validate()).toThrow();

      config.rateLimit.provider = current;
    });

    it('throws when rate limit provider is redis but uri is not set', () => {
      const current = config.rateLimit.provider;
      config.rateLimit.provider = 'redis';

      expect(() => config.validate()).toThrow();

      config.rateLimit.provider = current;
    });

    it('throws when db provider is unknown', () => {
      const current = config.db.provider;
      config.db.provider = 'foo-bar';

      expect(() => config.validate()).toThrow();

      config.db.provider = current;
    });

    it('throws when db provider is mongodb but uri is not set', () => {
      const current = config.db.provider;
      config.db.provider = 'mongodb';

      expect(() => config.validate()).toThrow();

      config.db.provider = current;
    });

    it('throws when db provider is mongodb but collection is not set', () => {
      const provider = config.db.provider;
      const uri = config.db.mongodb.uri;
      const collection = config.db.mongodb.collection;

      config.db.provider = 'mongodb';
      config.db.mongodb.uri = 'an-uri';
      config.db.mongodb.collection = '';

      expect(() => config.validate()).toThrow();

      config.db.mongodb.collection = collection;
      config.db.mongodb.uri = uri;
      config.db.provider = provider;
    });

    it('throws when storage temp location is not set', () => {
      const current = config.storage.tempLocation;
      config.storage.tempLocation = undefined;

      expect(() => config.validate()).toThrow();

      config.storage.tempLocation = current;
    });

    it('throws when storage provider is unknown', () => {
      const current = config.storage.provider;
      config.storage.provider = 'foo-bar';

      expect(() => config.validate()).toThrow();

      config.storage.provider = current;
    });

    it('throws when storage provider is gcp but key file location is not set', () => {
      const current = config.storage.provider;
      config.storage.provider = 'gcp';

      expect(() => config.validate()).toThrow();

      config.storage.provider = current;
    });

    it('throws when storage provider is gcp but bucket is not set', () => {
      const provider = config.storage.provider;
      const keyFile = config.storage.gcp.keyFileLocation;
      config.storage.provider = 'gcp';
      config.storage.gcp.keyFileLocation = 'key.json';

      expect(() => config.validate()).toThrow();

      config.storage.gcp.keyFileLocation = keyFile;
      config.storage.provider = provider;
    });

    it('does not throw when gcp is properly configured', () => {
      const provider = config.storage.provider;
      const keyFile = config.storage.gcp.keyFileLocation;
      const bucket = config.storage.gcp.bucket;
      config.storage.provider = 'gcp';
      config.storage.gcp.keyFileLocation = 'key.json';
      config.storage.gcp.bucket = 'a-bucket';

      expect(() => config.validate()).not.toThrow();

      config.storage.gcp.bucket = bucket;
      config.storage.gcp.keyFileLocation = keyFile;
      config.storage.provider = provider;
    });

    it('throws when storage provider is aws but access key id is not set', () => {
      const provider = config.storage.provider;

      config.storage.provider = 'aws';

      expect(() => config.validate()).toThrow();

      config.storage.provider = provider;
    });

    it('throws when storage provider is aws but secret access key is not set', () => {
      const provider = config.storage.provider;
      const accessKeyId = config.storage.aws.accessKeyId;

      config.storage.provider = 'aws';
      config.storage.aws.accessKeyId = 'ID';

      expect(() => config.validate()).toThrow();

      config.storage.aws.accessKeyId = accessKeyId;
      config.storage.provider = provider;
    });

    it('throws when storage provider is aws but region is not set', () => {
      const provider = config.storage.provider;
      const accessKeyId = config.storage.aws.accessKeyId;
      const secretAccessKIey = config.storage.aws.secretAccessKey;
      const region = config.storage.aws.region;

      config.storage.provider = 'aws';
      config.storage.aws.accessKeyId = 'ID';
      config.storage.aws.secretAccessKey = 'secret';
      config.storage.aws.region = '';

      expect(() => config.validate()).toThrow();

      config.storage.aws.accessKeyId = accessKeyId;
      config.storage.aws.secretAccessKey = secretAccessKIey;
      config.storage.aws.region = region;
      config.storage.provider = provider;
    });

    it('throws when storage provider is aws but bucket is not set', () => {
      const provider = config.storage.provider;
      const accessKeyId = config.storage.aws.accessKeyId;
      const secretAccessKIey = config.storage.aws.secretAccessKey;
      const region = config.storage.aws.region;
      const bucket = config.storage.aws.bucket;

      config.storage.provider = 'aws';
      config.storage.aws.accessKeyId = 'ID';
      config.storage.aws.secretAccessKey = 'secret';
      config.storage.aws.region = 'eu-west1';
      config.storage.aws.bucket = undefined;

      expect(() => config.validate()).toThrow();

      config.storage.aws.accessKeyId = accessKeyId;
      config.storage.aws.secretAccessKey = secretAccessKIey;
      config.storage.aws.region = region;
      config.storage.aws.bucket = bucket;
      config.storage.provider = provider;
    });

    it('does not throw when aws is properly configured', () => {
      const provider = config.storage.provider;
      const accessKeyId = config.storage.aws.accessKeyId;
      const secretAccessKIey = config.storage.aws.secretAccessKey;
      const region = config.storage.aws.region;
      const bucket = config.storage.aws.bucket;

      config.storage.provider = 'aws';
      config.storage.aws.accessKeyId = 'ID';
      config.storage.aws.secretAccessKey = 'secret';
      config.storage.aws.region = 'eu-west1';
      config.storage.aws.bucket = 'a-bucket';

      expect(() => config.validate()).not.toThrow();

      config.storage.aws.accessKeyId = accessKeyId;
      config.storage.aws.secretAccessKey = secretAccessKIey;
      config.storage.aws.region = region;
      config.storage.aws.bucket = bucket;
      config.storage.provider = provider;
    });

    it('throws when storage provider is az but storage account is not set', () => {
      const provider = config.storage.provider;

      config.storage.provider = 'az';

      expect(() => config.validate()).toThrow();

      config.storage.provider = provider;
    });

    it('throws when storage provider is az but access key is not set', () => {
      const provider = config.storage.provider;
      const storageAccountName = config.storage.az.storageAccountName;
      const accountAccessKey = config.storage.az.storageAccountAccessKey;

      config.storage.provider = 'az';
      config.storage.az.storageAccountName = 'account';
      config.storage.az.storageAccountAccessKey = undefined;

      expect(() => config.validate()).toThrow();

      config.storage.az.storageAccountName = storageAccountName;
      config.storage.az.storageAccountAccessKey = accountAccessKey;
      config.storage.provider = provider;
    });

    it('throws when storage provider is az but container is not set', () => {
      const provider = config.storage.provider;
      const storageAccountName = config.storage.az.storageAccountName;
      const accountAccessKey = config.storage.az.storageAccountAccessKey;
      const container = config.storage.az.storageContainer;

      config.storage.provider = 'az';
      config.storage.az.storageAccountName = 'account';
      config.storage.az.storageAccountAccessKey = 'KEY';
      config.storage.az.storageContainer = null;

      expect(() => config.validate()).toThrow();

      config.storage.az.storageAccountName = storageAccountName;
      config.storage.az.storageAccountAccessKey = accountAccessKey;
      config.storage.az.storageContainer = container;
      config.storage.provider = provider;
    });

    it('does not throw when az is properly configured', () => {
      const provider = config.storage.provider;
      const storageAccountName = config.storage.az.storageAccountName;
      const accountAccessKey = config.storage.az.storageAccountAccessKey;
      const container = config.storage.az.storageContainer;

      config.storage.provider = 'az';
      config.storage.az.storageAccountName = 'account';
      config.storage.az.storageAccountAccessKey = 'KEY';
      config.storage.az.storageContainer = 'container';

      expect(() => config.validate()).not.toThrow();

      config.storage.az.storageAccountName = storageAccountName;
      config.storage.az.storageAccountAccessKey = accountAccessKey;
      config.storage.az.storageContainer = container;
      config.storage.provider = provider;
    });

    it('throws when storage provider is local but location is not set', () => {
      const current = config.storage.provider;
      const location = config.storage.local.location;
      config.storage.provider = 'local';
      config.storage.local.location = undefined;

      expect(() => config.validate()).toThrow();

      config.storage.local.location = location;
      config.storage.provider = current;
    });

    it('throw when garbage collection is enabled but cron expression is not set', () => {
      const enabled = config.garbageCollection.enabled;
      const cronExpression = config.garbageCollection.cronExpression;

      config.garbageCollection.enabled = true;
      config.garbageCollection.cronExpression = undefined;

      expect(() => config.validate()).toThrow();

      config.garbageCollection.cronExpression = cronExpression;
      config.garbageCollection.enabled = enabled;
    });

    it('throw when garbage collection is enabled but inactive duration is not set', () => {
      const enabled = config.garbageCollection.enabled;
      const inactiveDuration = config.garbageCollection.inactiveDuration;

      config.garbageCollection.enabled = true;
      config.garbageCollection.inactiveDuration = undefined;

      expect(() => config.validate()).toThrow();

      config.garbageCollection.inactiveDuration = inactiveDuration;
      config.garbageCollection.enabled = enabled;
    });
  });
});
