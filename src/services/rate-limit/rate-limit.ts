export default interface RateLimit {
  canUpload(ipAddress: string): Promise<boolean>;
  recordUpload(ipAddress: string): Promise<void>;

  canDownload(ipAddress: string): Promise<boolean>;
  recordDownload(ipAddress: string): Promise<void>;
}
