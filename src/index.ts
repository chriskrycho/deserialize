import { Maybe, Result } from 'true-myth';
import { Just, Nothing } from 'true-myth/dist/types/src/maybe';

const isVoid = (value: any): value is null | undefined => value === undefined || value === null;

export type Data = { [key: string]: any } | null | undefined;
export type Rule<P> = { [K in keyof P]: (value: any) => Result<{ [Key in K]: P[K] }, string> };

export function deserialize<P>(fieldRules: Rule<P>): (data: Data) => Result<P, string[]>;
export function deserialize<P>(fieldRules: Rule<P>, data: Data): Result<P, string[]>;
export function deserialize<P>(
  fieldRules: Rule<P>,
  data?: Data
): Result<P, string[]> | ((fieldRules: Rule<P>) => Result<P, string[]>) {
  if (arguments.length === 1) {
    return (curriedData: Data) => deserialize(fieldRules, curriedData);
  }

  if (isVoid(data)) {
    return Result.err(['cannot deserialize `null` or `undefined']);
  }

  const results = (Object.keys(fieldRules) as (keyof P)[]).map(rule =>
    fieldRules[rule](data[rule])
  );

  const errs = results.filter(Result.isErr).map(Result.unsafelyUnwrapErr);
  if (errs.length > 0) {
    return Result.err(errs);
  }

  const p = results
    .filter(Result.isOk)
    .map(Result.unsafelyUnwrap)
    .reduce((merged, next) => Object.assign({}, merged, next), {} as P);

  return Result.ok(p);
}

export type DResult<T> = Result<T, string>;

export function required<P = any>(name: keyof P): (value?: any) => DResult<any>;
export function required<P = any>(name: keyof P, value: any): DResult<any>;
export function required<P = any>(
  name: keyof P,
  value?: any
): DResult<any> | ((value: any) => DResult<any>) {
  if (arguments.length === 1) {
    return (curriedValue: any | null) => required(name, curriedValue);
  }

  return isVoid(value)
    ? Result.err(`required field '${name}' missing from object`)
    : Result.ok(value);
}

export function optional<T>(value?: T | null): DResult<Maybe<T>> {
  return Result.ok(Maybe.of(value));
}

export function isNumber<P = any>(name: keyof P): (value: any) => DResult<number>;
export function isNumber<P = any>(name: keyof P, value: any): DResult<number>;
export function isNumber<P = any>(
  name: keyof P,
  value?: any
): DResult<number> | ((value: any) => DResult<number>) {
  if (arguments.length === 1) {
    return (curriedValue: any) => isNumber(name, curriedValue);
  }

  return typeof value === 'number'
    ? Result.ok(value)
    : Result.err(`field '${name}' is not a number`);
}

export function isString<P = any>(name: keyof P): (value: any) => DResult<string>;
export function isString<P = any>(name: keyof P, value: any): DResult<string>;
export function isString<P = any>(
  name: keyof P,
  value?: any
): DResult<string> | ((value: any) => DResult<string>) {
  if (arguments.length === 1) {
    return (curriedValue: any) => isString(name, curriedValue);
  }

  return typeof value === 'string'
    ? Result.ok(value)
    : Result.err(`field '${name}' is not a string`);
}

export function isBoolean<P = any>(name: keyof P): (value: any) => DResult<boolean>;
export function isBoolean<P = any>(name: keyof P, value: any): DResult<boolean>;
export function isBoolean<P = any>(
  name: keyof P,
  value?: any
): DResult<boolean> | ((value: any) => DResult<boolean>) {
  if (arguments.length === 1) {
    return (curriedValue: any) => isBoolean(name, curriedValue);
  }

  return typeof value === 'boolean'
    ? Result.ok(value)
    : Result.err(`field '${name}' is not a boolean`);
}

export default {
  required,
  optional,
  isNumber,
  isString,
  isBoolean,
  deserialize,
};
