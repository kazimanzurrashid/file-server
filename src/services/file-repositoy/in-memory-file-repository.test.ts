import 'reflect-metadata';

import clock from '../../lib/clock';
import { IFileInfo } from './file-repository';
import InMemoryFileRepository from './in-memory-file-repository';

describe('InMemoryFileRepository', () => {
  const PublicKey = 'public-key';
  const PrivateKey = 'private-key';
  const MimeType = 'image/png';
  const Path = '/my_photo.jpg';
  const Size = 100;

  const createFileInfo = (): IFileInfo => {
    return {
      publicKey: PublicKey,
      privateKey: PrivateKey,
      mimeType: MimeType,
      path: Path,
      size: Size,
      lastActivity: clock.now()
    };
  };

  describe('#add', () => {
    const records: IFileInfo[] = [];

    beforeAll(async () => {
      const repo = new InMemoryFileRepository(records);
      await repo.add({
        publicKey: PublicKey,
        privateKey: PrivateKey,
        mimeType: MimeType,
        path: Path,
        size: Size
      });
    });

    it('adds the provided file', () => {
      const info = records[0];

      expect(info).toBeDefined();
      expect(info.publicKey).toEqual(PublicKey);
      expect(info.privateKey).toEqual(PrivateKey);
      expect(info.mimeType).toEqual(MimeType);
      expect(info.path).toEqual(Path);
      expect(info.size).toEqual(Size);
      expect(info.lastActivity).toBeDefined();
    });
  });

  describe('#delete', () => {
    describe('when called for existent file', () => {
      const records: IFileInfo[] = [];
      let ret: IFileInfo | undefined;

      beforeAll(async () => {
        records.push(createFileInfo());

        const repo = new InMemoryFileRepository(records);
        ret = await repo.delete(PrivateKey);
      });

      it('deletes the provided file', () => {
        expect(records.length).toEqual(0);
      });

      it('returns the deleted file info', () => {
        expect(ret).toBeDefined();
      });
    });

    describe('when called for non-existent file', () => {
      const records: IFileInfo[] = [];
      let ret: IFileInfo | undefined;

      beforeAll(async () => {
        records.push(createFileInfo());

        const repo = new InMemoryFileRepository(records);
        ret = await repo.delete('i-dont-exist');
      });

      it('does nothing', () => {
        expect(records.length).toEqual(1);
      });

      it('returns undefined', () => {
        expect(ret).toBeUndefined();
      });
    });
  });

  describe('#get', () => {
    describe('when called for existent file', () => {
      let info: IFileInfo;

      beforeAll(async () => {
        const records: IFileInfo[] = [createFileInfo()];

        const repo = new InMemoryFileRepository(records);

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
      let info: IFileInfo;

      beforeAll(async () => {
        const records: IFileInfo[] = [createFileInfo()];

        const repo = new InMemoryFileRepository(records);

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
        const records: IFileInfo[] = [createFileInfo()];

        const repo = new InMemoryFileRepository(records);

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

  describe('#listInactiveSince', () => {
    let matched: IFileInfo[];

    beforeAll(async () => {
      const records: IFileInfo[] = [];

      for (let i = 0; i < 5; i++) {
        const file = createFileInfo();

        file.lastActivity.setDate(file.lastActivity.getDate() - i);

        records.push(file);
      }

      const repo = new InMemoryFileRepository(records);

      const since = clock.now();
      since.setDate(since.getDate() - 2);

      matched = await repo.listInactiveSince(since, 20);
    });

    it('returns the matching files', () => {
      expect(matched).toHaveLength(3);
    });
  });
});
