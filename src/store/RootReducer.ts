import { combineReducers } from "redux";

import { UserReducerState, userReducer } from "../reducers/UserReducer";
import { appReducer, AppReducerState } from "../reducers/AppReducer";
import { photoReducer, PhotoReducerState } from "../reducers/PhotoReducer";

export interface AppStoreState {
  readonly app: AppReducerState;
  readonly user: UserReducerState;
  readonly photo: PhotoReducerState;
}

export const rootReducer = combineReducers<AppStoreState>({
  app: appReducer,
  user: userReducer,
  photo: photoReducer
});
