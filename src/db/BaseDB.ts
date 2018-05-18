import * as firebase from "firebase";
import { defer, Observable } from "rxjs";
import { Logger } from "../helpers/Logger";

export abstract class BaseDB {
  protected logger = new Logger("DB");

  protected root: string;
  protected database: firebase.database.Database;

  protected constructor(options: {
    root: string;
    database: firebase.database.Database;
  }) {
    this.root = options.root;
    this.database = options.database;
  }

  protected composePath(path: string[]) {
    return [this.root, ...path].map(x => (x == null ? null : x)).join("/");
  }

  protected on(
    type: string,
    path: string[],
  ): Observable<firebase.database.DataSnapshot> {
    return new Observable<firebase.database.DataSnapshot>(observer => {
      const listener = (snapshot: firebase.database.DataSnapshot) => {
        observer.next(snapshot);
      };

      const referencePath = this.composePath(path);
      const reference = this.database.ref(referencePath);

      this.logger.log(`on(${type}, ${referencePath})`);

      try {
        reference.on(type, listener);
      } catch (e) {
        observer.error(e);
      }

      return () => {
        this.logger.log(`off(${type}, ${referencePath})`);

        try {
          reference.off(type, listener);
        } catch (e) {
          this.logger.error(e);
        }
      };
    });
  }

  public subscribeTo(
    path: string[],
  ): Observable<firebase.database.DataSnapshot> {
    return this.on("value", path);
  }

  public set<T>(path: string[], value: T): Observable<T> {
    return defer(() => {
      const referencePath = this.composePath(path);
      const reference = this.database.ref(referencePath);

      this.logger.log(`set(${referencePath})`);

      return reference.set(value);
    });
  }
}
