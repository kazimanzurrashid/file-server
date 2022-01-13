import { Stream } from 'stream';

export default interface IFileStorage {
  put(sourcePath: string): Promise<string>;

  delete(path: string): Promise<void>;

  load(path: string): Promise<Stream>;
}
