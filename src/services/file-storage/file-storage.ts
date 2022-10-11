export interface Pipeable {
  // eslint-disable-next-line no-undef
  pipe<T extends NodeJS.WritableStream>(destination: T): void;
}

export default interface FileStorage {
  put(sourcePath: string): Promise<string>;

  delete(path: string): Promise<void>;

  load(path: string): Promise<Pipeable>;
}
