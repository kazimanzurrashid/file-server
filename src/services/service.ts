export default interface Service {
  isLive(): Promise<boolean>;
}
