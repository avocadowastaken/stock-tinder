import { DELETE, update } from "immupdate";
import { mapValues } from "lodash-es";
import { Action } from "redux";
import { NEVER, merge, of } from "rxjs";
import { switchMap } from "rxjs/operators";

import { DatabaseDeltaType } from "../db/BaseDB";
import { PhotoDB, PhotosDatabaseDelta } from "../db/PhotoDB";
import { PhotoDTO } from "../dto/PhotoDTO";
import {
  AsyncRequest,
  Dict,
  FulfillAction,
  PerformAction,
  createAsyncAction,
  createAsyncRequestReducer,
  createReducer,
  createRootReducer,
} from "../helpers/ReduxUtils";
import { AppEpic } from "../store/AppStore";
import { AppReducerActions } from "./AppReducer";

export enum PhotoReducerActions {
  PerformUpload = "Photo/PerformUpload",
  FulfillUpload = "Photo/FulfillUpload",
  RejectUpload = "Photo/RejectUpload",
  ResetUpload = "Photo/ResetUpload",

  PhotoAdded = "Photo/Added",
  PhotoChanged = "Photo/Changed",
  PhotoRemoved = "Photo/Removed",
}

interface UploadMeta {
  uri: string;
  name: string;
}

interface PhotosUpdatePayload {
  userId: string;
  photos: Dict<PhotoDTO>;
}

export interface PhotoReducerState {
  readonly upload: AsyncRequest;

  readonly photos: Dict<PhotoDTO>;
  readonly photoAuthors: Dict<string>;
}

export const photoReducer = createRootReducer<PhotoReducerState>(
  {
    photos: {},
    photoAuthors: {},
    upload: { requested: false, requesting: false, requestFailed: false },
  },

  createAsyncRequestReducer<PhotoReducerState>("upload", [
    PhotoReducerActions.PerformUpload,
    PhotoReducerActions.FulfillUpload,
    PhotoReducerActions.RejectUpload,
    PhotoReducerActions.ResetUpload,
  ]),

  createReducer<PhotoReducerState>(
    [PhotoReducerActions.PhotoAdded, PhotoReducerActions.PhotoChanged],
    (state, { payload }: FulfillAction<PhotosUpdatePayload>) =>
      update(state, {
        photos: update(state.photos, payload.photos),

        photoAuthors: update(
          state.photoAuthors,
          mapValues(payload.photos, () => payload.userId),
        ),
      }),
  ),

  createReducer<PhotoReducerState>(
    [PhotoReducerActions.PhotoRemoved],
    (state, { payload }: FulfillAction<PhotosUpdatePayload>) =>
      update(state, {
        photos: update(
          state.photos,
          mapValues(payload.photos, () => DELETE as any),
        ),
        photoAuthors: update(
          state.photoAuthors,
          mapValues(payload.photos, () => DELETE as any),
        ),
      }),
  ),
);

export const photoReducerEpic: AppEpic = (
  actionsStream,
  store,
  { storage, database },
) => {
  const photoDb = new PhotoDB(storage, database);

  return merge(
    actionsStream.ofType(AppReducerActions.Init).pipe(
      switchMap(() =>
        photoDb.subscribeToPhotos().pipe(
          switchMap((x: PhotosDatabaseDelta) => {
            switch (x.type) {
              case DatabaseDeltaType.ADDED:
                return of<FulfillAction<PhotosUpdatePayload>>({
                  meta: {},
                  payload: x.value,
                  type: PhotoReducerActions.PhotoAdded,
                });

              case DatabaseDeltaType.CHANGED:
                return of<FulfillAction<PhotosUpdatePayload>>({
                  meta: {},
                  payload: x.value,
                  type: PhotoReducerActions.PhotoChanged,
                });

              case DatabaseDeltaType.REMOVED:
                return of<FulfillAction<PhotosUpdatePayload>>({
                  meta: {},
                  payload: x.value,
                  type: PhotoReducerActions.PhotoRemoved,
                });

              default:
                return NEVER;
            }
          }),
        ),
      ),
    ),

    actionsStream
      .ofType(PhotoReducerActions.PerformUpload)
      .pipe(
        switchMap(({ meta }: PerformAction<UploadMeta>) =>
          createAsyncAction(
            meta,
            photoDb.uploadPhoto(store.value.app.deviceId, meta.uri, meta.name),
            PhotoReducerActions.FulfillUpload,
            PhotoReducerActions.RejectUpload,
          ),
        ),
      ),
  );
};

export function uploadPhoto(
  name: string,
  uri: string,
): PerformAction<UploadMeta> {
  return { meta: { uri, name }, type: PhotoReducerActions.PerformUpload };
}

export function resetUploadPhotoState(): Action {
  return { type: PhotoReducerActions.ResetUpload };
}
