import { Maybe, Result } from 'true-myth';

const isVoid = (value: any): value is undefined | null => value === undefined || value === null;

export type Decode<T> = (value: any) => Maybe<T>;

export type Rule<T> = {
  type: string;
  default: Maybe<T>;
  decode(value: any): Result<T, string>;
};

export type Rules<D> = { [K in keyof D]: Rule<D[K]> };

export type Payload = { [k: string]: any };

export const number: Decode<number> = (value: any) =>
  typeof value === 'number' ? Maybe.just(value) : Maybe.nothing();

export const string: Decode<string> = (value: any) =>
  typeof value === 'string' ? Maybe.just(value) : Maybe.nothing();

export function decode<D>(rules: Rules<D>, payload?: Payload): Result<D, string[]>;
export function decode<D>(rules: Rules<D>): (payload?: Payload) => Result<D, string[]>;
export function decode<D>(
  rules: Rules<D>,
  payload?: Payload
): Result<D, string[]> | ((payload: Payload) => Result<D, string[]>) {
  if (arguments.length === 1) {
    return (curriedPayload: Payload) => decode(rules, curriedPayload);
  }

  if (isVoid(payload)) {
    return Result.err(['cannot deserialize `null` or `undefined']);
  }

  type K = keyof Rules<D>;
  type Decoded = Result<D[K], string>;

  const results: Decoded[] = Object.entries(rules).map(([propName, prop]) => {
    let rule = prop as Rules<D>[K]; // Workaround for TS inanity.
    return rule.decode(payload[propName]).mapErr(e => `${propName}: ${e}`);
  });

  const errs = results.filter(Result.isErr).map(Result.unsafelyUnwrapErr);
  if (errs.length > 0) {
    return Result.err(errs);
  }

  const decoded = results
    .filter(Result.isOk)
    .map(Result.unsafelyUnwrap)
    .reduce((merged, next) => Object.assign({}, merged, next), {} as D);

  return Result.ok(decoded);
}

export type Required<T> = Result<T, string>;
export function required<T>(
  decode: Decode<T>,
  _default: Maybe<T>,
  type: string,
  value: any
): Required<T> {
  return decode(value)
    .or(_default)
    .toOkOrErr(`required ${type} missing and no default`);
}

export type Optional<T> = Result<Maybe<T>, string>;
export function optional<T>(decode: Decode<T>, value: any): Optional<T> {
  return Result.ok(decode(value));
}

export default {
  decode,
  required,
  optional,
  string,
  number,
};
