export abstract class BaseProvider {
  protected static instance: any;
  protected constructor() {}

  public static getInstance<T extends BaseProvider>(this: new (...args: any[]) => T, ...args: any[]): T {
    if (!this.instance) {
      throw new Error(`${this.name} must be initialized first`);
    }
    return this.instance;
  }

  public static initialize(apiKey: string): T {
    if (!this.instance) {
      this.instance = new this(apiKey);
    }
    return this.instance;
  }
}
