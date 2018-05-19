import { combineEpics } from "redux-observable";

import { photoReducerEpic } from "../reducers/PhotoReducer";
import { userReducerEpic } from "../reducers/UserReducer";

export const rootEpic = combineEpics(userReducerEpic, photoReducerEpic);
