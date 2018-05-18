import { BaseDB } from "./BaseDB";
import * as firebase from "firebase";
import { Observable } from "rxjs";
import { UserDTO } from "../dto/UserDTO";
import { map } from "rxjs/operators";
import { classToPlain, plainToClass } from "class-transformer";

export class UserDB extends BaseDB {
  public constructor(database: firebase.database.Database) {
    super({ root: "users", database });
  }

  public getUser(id: string): Observable<undefined | UserDTO> {
    return this.subscribeTo([id, "info"]).pipe(
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
}
