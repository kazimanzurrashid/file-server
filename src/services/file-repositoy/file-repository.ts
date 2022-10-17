import Service from '../service';

export interface FileInfo {
  publicKey: string;
  privateKey: string;
  mimeType: string;
  path: string;
  size: number;
  lastActivity: Date;
  originalName: string;
}

export type AddFileInfo = Omit<FileInfo, 'lastActivity'>;

export default interface FileRepository extends Service {
  add(arg: AddFileInfo): Promise<void>;

  delete(privateKey: string): Promise<FileInfo | undefined>;

  get(publicKey: string): Promise<FileInfo | undefined>;

  listInactiveSince(timestamp: Date, max?: number): Promise<FileInfo[]>;
}
