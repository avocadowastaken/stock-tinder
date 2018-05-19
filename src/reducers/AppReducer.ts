import { Constants } from "expo";
import { Action } from "redux";

import { createRootReducer } from "../helpers/ReduxUtils";

export enum AppReducerActions {
  Init = "App/Init",
}

export interface AppReducerState {
  readonly deviceId: string;
}

export const appReducer = createRootReducer<AppReducerState>({
  deviceId: Constants.deviceId, // TODO: Fulfill from init action.
});

export function initApp(): Action<AppReducerActions> {
  return { type: AppReducerActions.Init };
}
