import { Maybe, Result } from 'true-myth';
import * as D from './alt';

describe('helpers', () => {});

type Data = { someProp: string };
const rules: D.Rules<Data> = {
  someProp: {
    type: 'string',
    default: Maybe.nothing(),
    decode(value: any) {
      return D.required(D.string, this.default, this.type, value);
    },
  },
};

describe('`decode`', () => {
  test('`undefined` payload', () => {
    expect(D.decode(rules, undefined)).toEqual(
      Result.err(['cannot deserialize `null` or `undefined'])
    );

    expect(D.decode(rules)(undefined)).toEqual(
      Result.err(['cannot deserialize `null` or `undefined'])
    );
  });

  test('valid payload', () => {
    const data: Data = { someProp: 'hello' };
    expect(D.decode(rules, data)).toEqual(Result.ok(data));
    expect(D.decode(rules)(data)).toEqual(Result.ok(data));
  });

  test('valid, complex payload', () => {
    type ComplexData = { someProp: string; otherProp: Maybe<number> };
    const data = { someProp: 'hello', otherProp: 12 };
    const expected: ComplexData = { someProp: 'hello', otherProp: Maybe.just(12) };
    expect(D.decode(rules, data)).toEqual(Result.ok(expected));
    expect(D.decode(rules)(data)).toEqual(Result.ok(expected));
  });

  test('general example', () => {
    type Data = { someProp: string; otherProp: Maybe<number> };

    const badData = { someProp: null };

    const someRules: D.Rules<Data> = {
      someProp: {
        type: 'string',
        default: Maybe.just(''),
        decode(value: any) {
          return D.required(D.string, this.default, this.type, value);
        },
      },
      otherProp: {
        type: 'number',
        default: Maybe.nothing(),
        decode(value: any) {
          return D.optional(D.number, value);
        },
      },
    };

    const decoded = D.decode(someRules, badData);
    expect(decoded).toEqual(Result.err(`required 'string' missing and no default`));
  });
});
