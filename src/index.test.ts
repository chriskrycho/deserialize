import { Maybe, Result } from 'true-myth';
import D from './index';

type Nullable<T> = { [Key in keyof T]: T | null };

const requiredMessage = (fieldName: string) => `required field '${fieldName}' missing from object`;
const typeMessage = (fieldName: string, typeName: string) =>
  `field '${fieldName}' is not a ${typeName}`;

describe('helpers', () => {
  test('`required`', () => {
    expect(D.required('foo', undefined)).toEqual(Result.err(requiredMessage('foo')));
    expect(D.required('foo', null)).toEqual(Result.err(requiredMessage('foo')));
    expect(D.required('foo', 'hi')).toEqual(Result.ok('hi'));
  });

  test('`optional`', () => {
    expect(D.optional(undefined)).toEqual(Result.ok(Maybe.nothing()));
    expect(D.optional(null)).toEqual(Result.ok(Maybe.nothing()));
    expect(D.optional('hello')).toEqual(Result.ok(Maybe.just('hello')));
  });

  test('`isNumber`', () => {
    expect('implemented').toBe(true);
  });

  test('`isString`', () => {
    expect('implemented').toBe(true);
  });

  test('`isBoolean`', () => {
    expect('implemented').toBe(true);
  });
});

describe('`deserialize`', () => {
  test('empty payloads', () => {
    const message = 'cannot deserialize `null` or `undefined';

    type Data = { theProperty: boolean };
    const op = D.deserialize<Data>({
      theProperty: value =>
        D.required<Data>('theProperty', value)
          .andThen(D.isBoolean('theProperty'))
          .map(theProperty => ({ theProperty })),
    });

    expect(op(null)).toEqual(Result.err([message]));
    expect(op(undefined)).toEqual(Result.err([message]));
  });

  test('incomplete types', () => {
    type Data = { theProperty: number };
    const op = D.deserialize<Data>({
      theProperty: value =>
        D.required<Data>('theProperty', value)
          .andThen(D.isNumber('theProperty'))
          .map(theProperty => ({ theProperty })),
    });

    expect(op({})).toEqual(Result.err([requiredMessage('theProperty')]));
  });

  test('incorrect types', () => {
    type Data = { theProperty: string };
    const badData = { theProperty: 12 };
    const op = D.deserialize<Data>({
      theProperty: value => D.isString('theProperty', value).map(theProperty => ({ theProperty })),
    });

    expect(op(badData)).toEqual(Result.err([typeMessage('theProperty', 'string')]));
  });

  test('maybe types', () => {
    type Data = { theProperty: Maybe<number> };

    const op = D.deserialize<Data>({
      theProperty: value => D.optional(value).map(theProperty => ({ theProperty })),
    });

    const emptyPayload: Partial<Data> = {};
    expect(op(emptyPayload)).toEqual(Result.ok({ theProperty: Maybe.nothing() }));

    const nullPayload: Nullable<Data> = { theProperty: null };
    expect(op(nullPayload)).toEqual(Result.ok({ theProperty: Maybe.nothing() }));

    const validPayload = { theProperty: 12 };
    expect(op(validPayload)).toEqual(Result.ok({ theProperty: Maybe.just(12) }));
  });

  test('complete types', () => {
    expect('implemented').toBe(true);
  });

  test('nested types', () => {
    expect('implemented').toBe(true);
  });
});
