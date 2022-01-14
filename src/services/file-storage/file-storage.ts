export interface IPipeable {
  // eslint-disable-next-line no-undef
  pipe<T extends NodeJS.WritableStream>(destination: T): void;
}

export default interface IFileStorage {
  put(sourcePath: string): Promise<string>;

  delete(path: string): Promise<void>;

  load(path: string): Promise<IPipeable>;
}
