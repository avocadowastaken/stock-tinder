import debug from "debug";

if (__DEV__) {
  debug.enable("App:*");
}

export class Logger {
  private readonly logger?: debug.IDebugger;

  public constructor(namespace: string) {
    if (__DEV__) {
      this.logger = debug(`App:${namespace}`);
    }
  }

  public log(message: string, ...args: any[]) {
    if (this.logger) {
      this.logger(message, ...args);
    }
  }

  public error(error: Error, ...args: any[]) {
    this.log(error.message, ...args);
  }
}
