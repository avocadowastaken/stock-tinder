import { BaseDB } from "./BaseDB";
import * as firebase from "firebase";
import { defer } from "rxjs";
import uuid from "uuid";
import { switchMap } from "rxjs/operators";
import { PhotoDTO } from "../dto/PhotoDTO";
import { classToPlain } from "class-transformer";

export class PhotoDB extends BaseDB {
  private storage: firebase.storage.Storage;

  public constructor(
    storage: firebase.storage.Storage,
    database: firebase.database.Database,
  ) {
    super({ database, root: "photo" });

    this.storage = storage;
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
        .then(url => new PhotoDTO({ id, name, url }));
    }).pipe(
      switchMap((x: PhotoDTO) => this.set([userId, x.id], classToPlain(x))),
    );
  }
}
