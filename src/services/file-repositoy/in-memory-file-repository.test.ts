import 'reflect-metadata';

import clock from '../../lib/clock';
import key from '../../lib/key';
import { FileInfo } from './file-repository';
import InMemoryFileRepository from './in-memory-file-repository';

class InMemoryFileRepositoryTestDouble extends InMemoryFileRepository {
  get internalRecords(): FileInfo[] {
    return this.records;
  }
}

describe('InMemoryFileRepository', () => {
  const PublicKey = key.generate();
  const PrivateKey = key.generate();
  const MimeType = 'image/png';
  const Path = 'a1f1457845cf420c883d46abc5a5c844.jpg';
  const OriginalName = 'my-photo.jpg';

  const Size = 100;

  const createFileInfo = (): FileInfo => {
    return {
      publicKey: PublicKey,
      privateKey: PrivateKey,
      mimeType: MimeType,
      path: Path,
      size: Size,
      lastActivity: clock.now(),
      originalName: OriginalName
    };
  };

  describe('add', () => {
    let repo: InMemoryFileRepositoryTestDouble;

    beforeAll(async () => {
      repo = new InMemoryFileRepositoryTestDouble();

      await repo.add(createFileInfo());
    });

    it('adds the provided file', () => {
      const info = repo.internalRecords[0];

      expect(info).toBeDefined();
      expect(info.publicKey).toEqual(PublicKey);
      expect(info.privateKey).toEqual(PrivateKey);
      expect(info.mimeType).toEqual(MimeType);
      expect(info.path).toEqual(Path);
      expect(info.size).toEqual(Size);
      expect(info.originalName).toEqual(OriginalName);
      expect(info.lastActivity).toBeDefined();
    });
  });

  describe('delete', () => {
    describe('when called for existent file', () => {
      let repo: InMemoryFileRepositoryTestDouble;
      let ret: FileInfo | undefined;

      beforeAll(async () => {
        repo = new InMemoryFileRepositoryTestDouble();
        repo.internalRecords.push(createFileInfo());

        ret = await repo.delete(PrivateKey);
      });

      it('deletes the provided file', () => {
        expect(repo.internalRecords.length).toEqual(0);
      });

      it('returns the deleted file info', () => {
        expect(ret).toBeDefined();
      });
    });

    describe('when called for non-existent file', () => {
      let repo: InMemoryFileRepositoryTestDouble;
      let ret: FileInfo | undefined;

      beforeAll(async () => {
        repo = new InMemoryFileRepositoryTestDouble();
        repo.internalRecords.push(createFileInfo());

        ret = await repo.delete('i-dont-exist');
      });

      it('does nothing', () => {
        expect(repo.internalRecords.length).toEqual(1);
      });

      it('returns undefined', () => {
        expect(ret).toBeUndefined();
      });
    });
  });

  describe('get', () => {
    describe('when called for existent file', () => {
      let info: FileInfo;

      beforeAll(async () => {
        const repo = new InMemoryFileRepositoryTestDouble();
        repo.internalRecords.push(createFileInfo());

        info = await repo.get(PublicKey);
      });

      it('returns matching file info', () => {
        expect(info).toBeDefined();
        expect(info.publicKey).toEqual(PublicKey);
        expect(info.privateKey).toEqual(PrivateKey);
        expect(info.path).toEqual(Path);
        expect(info.mimeType).toEqual(MimeType);
        expect(info.lastActivity).toBeDefined();
      });
    });

    describe('when called for non-existent file', () => {
      let info: FileInfo;

      beforeAll(async () => {
        const repo = new InMemoryFileRepositoryTestDouble();
        repo.internalRecords.push(createFileInfo());

        info = await repo.get('i-dont-exist');
      });

      it('returns undefined', () => {
        expect(info).toBeUndefined();
      });
    });

    describe('when called consequently', () => {
      let oldLastActivity: Date;
      let newLastActivity: Date;

      beforeAll(async () => {
        const repo = new InMemoryFileRepositoryTestDouble();
        repo.internalRecords.push(createFileInfo());

        const oldInfo = await repo.get(PublicKey);
        oldLastActivity = oldInfo.lastActivity;

        await new Promise((resolve) => setTimeout(resolve, 10));

        const newInfo = await repo.get(PublicKey);
        newLastActivity = newInfo.lastActivity;
      });

      it('updates last activity', () => {
        expect(newLastActivity.getTime()).toBeGreaterThan(
          oldLastActivity.getTime()
        );
      });
    });
  });

  describe('listInactiveSince', () => {
    let matched: FileInfo[];

    beforeAll(async () => {
      const records: FileInfo[] = [];

      for (let i = 0; i < 5; i++) {
        const file = createFileInfo();

        file.lastActivity.setDate(file.lastActivity.getDate() - i);

        records.push(file);
      }

      const repo = new InMemoryFileRepositoryTestDouble();
      repo.internalRecords.push(...records);

      const since = clock.now();
      since.setDate(since.getDate() - 2);

      matched = await repo.listInactiveSince(since);
    });

    it('returns the matching files', () => {
      expect(matched).toHaveLength(3);
    });
  });

  describe('isLive', () => {
    it('always returns true', async () => {
      const live = await new InMemoryFileRepository().isLive();

      expect(live).toEqual(true);
    });
  });
});
