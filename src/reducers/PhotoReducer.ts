import {
  AsyncRequest,
  createAsyncAction,
  createAsyncRequestReducer,
  createRootReducer,
  PerformAction,
} from "../helpers/ReduxUtils";
import { AppEpic } from "../store/AppStore";
import { merge } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Action } from "redux";
import { PhotoDB } from "../db/PhotoDB";

export enum PhotoReducerActions {
  PerformUpload = "Photo/PerformUpload",
  FulfillUpload = "Photo/FulfillUpload",
  RejectUpload = "Photo/RejectUpload",
  ResetUpload = "Photo/ResetUpload",
}

interface UploadMeta {
  uri: string;
  name: string;
}

export interface PhotoReducerState {
  readonly upload: AsyncRequest;
}

export const photoReducer = createRootReducer<PhotoReducerState>(
  { upload: { requested: false, requesting: false, requestFailed: false } },

  createAsyncRequestReducer<PhotoReducerState>("upload", [
    PhotoReducerActions.PerformUpload,
    PhotoReducerActions.FulfillUpload,
    PhotoReducerActions.RejectUpload,
    PhotoReducerActions.ResetUpload,
  ]),
);

export const photoReducerEpic: AppEpic = (
  actionsStream,
  store,
  { storage, database },
) => {
  const photoDb = new PhotoDB(storage, database);

  return merge(
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
