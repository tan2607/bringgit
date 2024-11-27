export abstract class BaseProvider {
  protected static instance: any;
  protected constructor() {}

  public static getInstance<T extends BaseProvider>(this: new (...args: any[]) => T, ...args: any[]): T {
    if (!this.instance) {
      this.instance = new this(...args);
    }
    return this.instance;
  }
}
