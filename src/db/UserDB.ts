import { classToPlain, plainToClass } from "class-transformer";
import * as firebase from "firebase";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { UserDTO } from "../dto/UserDTO";
import { BaseDB, DatabaseDelta } from "./BaseDB";

export class UserDB extends BaseDB {
  public constructor(database: firebase.database.Database) {
    super({ root: "users", database });
  }

  public getUser(id: string): Observable<undefined | UserDTO> {
    return this.subscribeToValue([id, "info"]).pipe(
      map(
        x => (!x.exists ? undefined : plainToClass(UserDTO, x.val() as object)),
      ),
    );
  }

  public updateUser(id: string, user: UserDTO): Observable<void> {
    return this.set([id, "info"], classToPlain(user)).pipe(
      map(() => undefined),
    );
  }

  public subscribeToUsers(): Observable<DatabaseDelta<UserDTO>> {
    return this.subscribeToList([]).pipe(
      map(x => ({
        type: x.type,
        value: plainToClass(UserDTO, x.value.val().info as object),
      })),
    );
  }
}
