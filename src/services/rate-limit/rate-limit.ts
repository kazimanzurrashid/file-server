import Service from '../service';

export default interface RateLimit extends Service {
  canUpload(ipAddress: string): Promise<boolean>;
  recordUpload(ipAddress: string): Promise<void>;

  canDownload(ipAddress: string): Promise<boolean>;
  recordDownload(ipAddress: string): Promise<void>;

  reset(): Promise<void>;
}
