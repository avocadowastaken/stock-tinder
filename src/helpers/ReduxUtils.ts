import { DELETE, deepUpdate, update } from "immupdate";
import { Action, Reducer } from "redux";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

export interface Dict<T> {
  readonly [key: string]: T;
}

export interface PerformAction<M = {}> extends Action {
  readonly meta: M;
}

export interface FulfillAction<P = {}, M = {}> extends PerformAction<M> {
  readonly payload: P;
}

export interface RejectAction<M = {}> extends PerformAction<M> {
  readonly error: true;
  readonly payload: Error;
}

export interface AsyncValue<T> {
  readonly value?: T;
  readonly error?: Error;
  readonly loading: boolean;
}

export function createRootReducer<S>(
  initialState: S,
  ...reducers: Array<Reducer<S>>
): Reducer<S> {
  return (state = initialState, action: Action) => {
    let nextState = state;

    reducers.forEach(reducer => {
      nextState = reducer(nextState, action);
    });

    return nextState;
  };
}

export type ChildReducer<S> = (state: S, action: Action) => S;

export function createReducer<S>(
  types: string[],
  reducer: ChildReducer<S>,
): ChildReducer<S> {
  return (state, action): S =>
    types.includes(action.type) ? reducer(state, action) : state;
}

function getPlainAsyncValue(): AsyncValue<any> {
  return { loading: false };
}

export function createAsyncValueReducer<S>(
  key: keyof S,
  [perform, fulfill, reject]: [string, string, string],
): Reducer<S> {
  return (state: any, action): S => {
    switch (action.type) {
      case perform: {
        return deepUpdate(state)
          .at(key as any)
          .modify((x: AsyncValue<any> = getPlainAsyncValue()) =>
            update(x, { loading: true }),
          );
      }

      case fulfill: {
        const { payload } = action as FulfillAction<any, any>;

        return deepUpdate(state)
          .at(key as any)
          .modify((x = getPlainAsyncValue()) =>
            update(x, { value: payload, loading: false, error: undefined }),
          );
      }

      case reject: {
        const { payload } = action as RejectAction<any>;

        return deepUpdate(state)
          .at(key as any)
          .modify((x = getPlainAsyncValue()) =>
            update(x, { error: payload, loading: false }),
          );
      }

      default:
        return state;
    }
  };
}

export function createAsyncValueDictReducer<S extends object, M>(
  key: keyof S,
  getHash: (action: PerformAction<M>) => string,
  [perform, fulfill, reject]: [string, string, string],
): Reducer<S> {
  return createReducer([perform, fulfill, reject], (state: any, action) => {
    const hash = getHash(action as PerformAction<M>) as any;
    const itemReducer = createAsyncValueReducer<any>(hash, [
      perform,
      fulfill,
      reject,
    ]);

    return { ...state, [key]: itemReducer(state[key], action) };
  });
}

export function createAsyncAction<M = {}, P = {}>(
  meta: M,
  stream: Observable<P>,
  fulfill: string,
  reject?: string,
): Observable<FulfillAction<P, M> | RejectAction<M>> {
  return stream.pipe(
    map(x => ({ meta, payload: x, type: fulfill })),
    catchError(err => {
      if (!reject) {
        throw err;
      }

      return of({
        meta,
        error: true,
        type: reject,
        payload: err,
      });
    }),
  );
}

//
// Async Request
//

export interface AsyncRequest {
  readonly error?: Error;
  readonly requested: boolean;
  readonly requesting: boolean;
  readonly requestFailed: boolean;
}

export function createAsyncRequestReducer<S extends object>(
  key: keyof S,
  [perform, fulfill, reject, reset]: [string, string, string, string],
): ChildReducer<S> {
  return (state: any, action): S => {
    switch (action.type) {
      case perform: {
        return deepUpdate(state)
          .at(key as any)
          .modify((x: AsyncRequest) =>
            update(x, { requested: true, requesting: true }),
          );
      }

      case fulfill: {
        return deepUpdate(state)
          .at(key as any)
          .modify((x: AsyncRequest) =>
            update(x, {
              error: DELETE,
              requesting: false,
              requestFailed: false,
            }),
          );
      }

      case reject: {
        const { payload } = action as RejectAction<{}>;

        return deepUpdate(state)
          .at(key as any)
          .modify((x: AsyncRequest) =>
            update(x, {
              error: payload,
              requesting: false,
              requestFailed: true,
            }),
          );
      }

      case reset: {
        return deepUpdate(state)
          .at(key as any)
          .modify((x: AsyncRequest) =>
            update(x, {
              error: DELETE,
              requested: false,
              requesting: false,
              requestFailed: false,
            }),
          );
      }

      default:
        return state;
    }
  };
}

//
// Infinite List
//

export interface AsyncValueDict<T> {
  readonly [key: string]: AsyncValue<T>;
}

export interface AsyncInfiniteList {
  readonly page: number;
  readonly error?: Error;
  readonly loading: boolean;

  readonly count: number;
  readonly ids?: Array<number | string>;
}

export interface AsyncInfiniteListDict {
  readonly [query: string]: AsyncInfiniteList;
}

export function updateInfiniteList(
  lists: AsyncInfiniteListDict,
  query: string,
  modifier: (value: AsyncInfiniteList) => AsyncInfiniteList,
): AsyncInfiniteListDict {
  return deepUpdate(lists)
    .at(query)
    .withDefault({ page: 0, count: -1, loading: false })
    .modify(modifier);
}
