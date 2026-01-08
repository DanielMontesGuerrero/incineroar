export type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T[P] extends Function
      ? T[P]
      : DeepRequired<T[P]>
    : T[P];
};
