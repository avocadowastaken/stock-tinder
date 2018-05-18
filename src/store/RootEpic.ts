import { combineEpics } from "redux-observable";
import { userReducerEpic } from "../reducers/UserReducer";
import { photoReducerEpic } from "../reducers/PhotoReducer";

export const rootEpic = combineEpics(userReducerEpic, photoReducerEpic);
