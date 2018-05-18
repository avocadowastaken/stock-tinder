import * as firebase from "firebase";
import { Action, Store, applyMiddleware, createStore } from "redux";
import { createEpicMiddleware, Epic } from "redux-observable";

import { createReduxLoggerMiddleware } from "./ReduxLoggerMiddleware";
import { rootEpic } from "./RootEpic";
import { AppStoreState, rootReducer } from "./RootReducer";

export type AppStore = Store<AppStoreState>;

export type AppEpic<O extends Action = Action> = Epic<
  Action,
  AppStoreState,
  EpicDependencies,
  O
>;

export interface EpicDependencies {
  storage: firebase.storage.Storage;
  database: firebase.database.Database;
}

export function configureStore(dependencies: EpicDependencies): AppStore {
  return createStore(
    rootReducer,
    applyMiddleware(
      createReduxLoggerMiddleware(),
      createEpicMiddleware<Action, AppStoreState, EpicDependencies>(rootEpic, {
        dependencies,
      }),
    ),
  );
}
