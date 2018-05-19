import { DELETE, update } from "immupdate";
import { Action } from "redux";
import { NEVER, merge, of } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";

import { DatabaseDelta, DatabaseDeltaType } from "../db/BaseDB";
import { UserDB } from "../db/UserDB";
import { UserDTO } from "../dto/UserDTO";
import {
  Dict,
  FulfillAction,
  PerformAction,
  createReducer,
  createRootReducer,
} from "../helpers/ReduxUtils";
import { AppEpic } from "../store/AppStore";
import { AppReducerActions } from "./AppReducer";

export enum UserReducerActions {
  PerformFetchMe = "User/PerformFetchMe",
  FulfillFetchMe = "User/FulfillFetchMe",

  UpdateMe = "User/UpdateMe",

  UserAdded = "User/Added",
  UserChanged = "User/Changed",
  UserRemoved = "User/Removed",
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

  createReducer<UserReducerState>(
    [UserReducerActions.UserAdded, UserReducerActions.UserChanged],
    (state, { payload }: FulfillAction<UserDTO>) =>
      update(state, {
        users: update(state.users, { [payload.id]: payload }),
      }),
  ),

  createReducer<UserReducerState>(
    [UserReducerActions.UserRemoved],
    (state, { payload }: FulfillAction<UserDTO>) =>
      update(state, {
        users: update(state.users, { [payload.id]: DELETE as any }),
      }),
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
            map((x: UserDTO): FulfillAction<UserDTO> => ({
              meta: {},
              type: UserReducerActions.FulfillFetchMe,
              payload:
                x || new UserDTO({ id: deviceId, createdAt: new Date() }),
            })),
          ),
        ),
      ),
    ),

    actionsStream.ofType(AppReducerActions.Init).pipe(
      switchMap(() =>
        userDB.subscribeToUsers().pipe(
          switchMap((x: DatabaseDelta<UserDTO>) => {
            switch (x.type) {
              case DatabaseDeltaType.ADDED:
                return of<FulfillAction<UserDTO>>({
                  meta: {},
                  payload: x.value,
                  type: UserReducerActions.UserAdded,
                });

              case DatabaseDeltaType.CHANGED:
                return of<FulfillAction<UserDTO>>({
                  meta: {},
                  payload: x.value,
                  type: UserReducerActions.UserChanged,
                });

              case DatabaseDeltaType.REMOVED:
                return of<FulfillAction<UserDTO>>({
                  meta: {},
                  payload: x.value,
                  type: UserReducerActions.UserRemoved,
                });

              default:
                return NEVER;
            }
          }),
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
