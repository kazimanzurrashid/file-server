class Clock {
  private _now: () => Date;

  constructor() {
    this.reset();
  }

  get now(): () => Date {
    return this._now;
  }

  set now(value: () => Date) {
    this._now = value;
  }

  reset(): void {
    this._now = () => new Date();
  }
}

export default new Clock();
