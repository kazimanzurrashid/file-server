export interface IFileInfo {
  publicKey: string;
  privateKey: string;
  mimeType: string;
  path: string;
  size: number;
  lastActivity: Date;
}

export type AddFileInfo = Omit<IFileInfo, 'lastActivity'>;

export default interface IFileRepository {
  add(arg: AddFileInfo): Promise<void>;

  delete(privateKey: string): Promise<IFileInfo | undefined>;

  get(publicKey: string): Promise<IFileInfo | undefined>;

  listInactiveSince(timestamp: Date): Promise<IFileInfo[]>;
}
