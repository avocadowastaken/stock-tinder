import { get, isEqual, isEqualWith, pick } from "lodash-es";

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

function createShallowEqualCustomizer<T>(depth: number = 1) {
  return (
    aVal: T[keyof T],
    bVal: T[keyof T],
    _idx: keyof T,
    _a: T,
    _b: T,
    stack?: any,
  ) => {
    // Shallow compares
    // For 1st level, `stack === undefined`.
    //   -> Do nothing (and implicitly return undefined so that it goes to compare 2nd level)
    // For 2nd level and up, `stack !== undefined`.
    //   -> Compare by `===` operator
    if (stack && stack.size > depth) {
      return aVal === bVal;
    }
  };
}

export function isShallowEqual<T>(a: T, b: T, depth?: number): boolean {
  return isEqualWith(a, b, createShallowEqualCustomizer(depth));
}

export function isEqualChild<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5]
>(a: T, b: T, key1: K1, key2?: K2, key3?: K3, key4?: K4, key5?: K5, key6?: K6) {
  const path = [key1, key2, key3, key4, key5, key6].filter(
    x => x != null,
  ) as any;
  const aChild = get(a, path);
  const bChild = get(b, path);

  return isEqual(aChild, bChild);
}

export function isEqualChildren<T, K1 extends keyof T>(a: T, b: T, keys: K1[]) {
  const aChildren = pick(a, ...keys);
  const bChildren = pick(b, ...keys);

  return isEqual(aChildren, bChildren);
}

export function insertArray<T>(current: T[], next: T[], index: number): T[] {
  // Return new empty array both values are empty.
  if (current.length === 0 && next.length === 0) {
    return [];
  }

  // Clone `next` value if `current` is empty.
  if (current.length === 0) {
    return next.slice();
  }

  // Clone `current` value if `next` is empty.
  if (next.length === 0) {
    return current.slice();
  }

  // Add to the end of array if index
  if (current.length === index + 1) {
    return current.concat(next);
  }

  const start = current.slice(0, index);
  const end = current.slice(index + next.length);

  return start.concat(next).concat(end);
}

export function tryParseJSON<T>(text: string): null | T {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function tryStringifyJSON<T>(data: T): null | string {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}
