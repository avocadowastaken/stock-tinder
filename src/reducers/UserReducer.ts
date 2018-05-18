import { UserDTO } from "../dto/UserDTO";
import { createReducer, createRootReducer, Dict, FulfillAction, PerformAction } from "../helpers/ReduxUtils";
import { AppEpic } from "../store/AppStore";
import { merge, NEVER, of } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { UserDB } from "../db/UserDB";
import { DELETE, update } from "immupdate";
import { Action } from "redux";

export enum UserReducerActions {
  PerformFetchMe = "User/PerformFetchMe",
  FulfillFetchMe = "User/FulfillFetchMe",

  UpdateMe = "User/UpdateMe",
}

interface UpdateMeMeta {
  me: UserDTO;
}

export interface UserReducerState {
  readonly me?: UserDTO;
  readonly users: Dict<UserDTO>;
}

export const userReducer = createRootReducer<UserReducerState>(
  { users: {} },

  createReducer<UserReducerState>([UserReducerActions.PerformFetchMe], state =>
    update(state, { me: DELETE }),
  ),

  createReducer<UserReducerState>(
    [UserReducerActions.FulfillFetchMe],
    (state, { payload }: FulfillAction<UserDTO>) =>
      update(state, { me: payload }),
  ),
);

export const userReducerEpic: AppEpic = (
  actionsStream,
  store,
  { database },
) => {
  const userDB = new UserDB(database);

  return merge(
    store.source.pipe(
      map(x => x.app.deviceId),
      distinctUntilChanged(),
      switchMap(deviceId =>
        merge(
          of<Action>({ type: UserReducerActions.PerformFetchMe }),
          userDB.getUser(deviceId).pipe(
            map<UserDTO, FulfillAction<UserDTO>>(x => ({
              meta: {},
              type: UserReducerActions.FulfillFetchMe,
              payload: x || new UserDTO({ id: deviceId }),
            })),
          ),
        ),
      ),
    ),

    actionsStream
      .ofType(UserReducerActions.UpdateMe)
      .pipe(
        switchMap(({ meta }: PerformAction<UpdateMeMeta>) =>
          userDB
            .updateUser(store.value.app.deviceId, meta.me)
            .pipe(switchMap(() => NEVER)),
        ),
      ),
  );
};

export function updateMe(me: UserDTO): PerformAction<UpdateMeMeta> {
  return { meta: { me }, type: UserReducerActions.UpdateMe };
}
