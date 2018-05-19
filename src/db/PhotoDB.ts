import { classToPlain, plainToClass } from "class-transformer";
import * as firebase from "firebase";
import { mapValues } from "lodash-es";
import { Observable, defer } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import uuid from "uuid";

import { PhotoDTO } from "../dto/PhotoDTO";
import { Dict } from "../helpers/ReduxUtils";
import { BaseDB, DatabaseDelta } from "./BaseDB";

export type PhotosDatabaseDelta = DatabaseDelta<{
  readonly userId: string;
  readonly photos: Dict<PhotoDTO>;
}>;

export class PhotoDB extends BaseDB {
  private storage: firebase.storage.Storage;

  public constructor(
    storage: firebase.storage.Storage,
    database: firebase.database.Database,
  ) {
    super({ database, root: "photo" });

    this.storage = storage;
  }

  public subscribeToPhotos(): Observable<PhotosDatabaseDelta> {
    return this.subscribeToList([]).pipe(
      map(result => ({
        type: result.type,
        value: {
          userId: result.value.key as string,
          photos: mapValues(result.value.val(), (x: object) =>
            plainToClass(PhotoDTO, x),
          ),
        },
      })),
    );
  }

  public uploadPhoto(userId: string, uri: string, name: string) {
    return defer(() => {
      const ext = uri.split(".").pop();
      const id = uuid.v4();
      const fileName = `${id}.${ext}`;

      return fetch(uri)
        .then(x => x.blob())
        .then(x =>
          this.storage
            .ref(userId)
            .child(fileName)
            .put(x),
        )
        .then(x => x.ref.getDownloadURL())
        .then(url => new PhotoDTO({ id, name, url, createdAt: new Date() }));
    }).pipe(
      switchMap((x: PhotoDTO) => this.set([userId, x.id], classToPlain(x))),
    );
  }
}
