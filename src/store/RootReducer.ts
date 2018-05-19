import { combineReducers } from "redux";

import { AppReducerState, appReducer } from "../reducers/AppReducer";
import { PhotoReducerState, photoReducer } from "../reducers/PhotoReducer";
import { UserReducerState, userReducer } from "../reducers/UserReducer";

export interface AppStoreState {
  readonly app: AppReducerState;
  readonly user: UserReducerState;
  readonly photo: PhotoReducerState;
}

export const rootReducer = combineReducers<AppStoreState>({
  app: appReducer,
  user: userReducer,
  photo: photoReducer,
});
