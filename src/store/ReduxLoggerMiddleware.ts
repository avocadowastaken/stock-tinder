import { Action, Dispatch, Middleware } from "redux";

import { tryStringifyJSON } from "../helpers/DataUtils";
import { Logger } from "../helpers/Logger";

export function createReduxLoggerMiddleware(): Middleware {
  const logger = new Logger("redux");

  return () => (next: Dispatch<Action>) => action => {
    if (__DEV__) {
      logger.log(`Action: ${action.type} -> ${tryStringifyJSON(action)}`);

      if (action.error) {
        logger.error(action.payload);
      }
    }

    try {
      return next(action);
    } catch (e) {
      logger.error(e, { action: tryStringifyJSON(action) });

      throw e;
    }
  };
}
