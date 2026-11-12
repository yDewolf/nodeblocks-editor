import en from "./langs/en";
import pt from "./langs/pt";

export const localeDicts = { en, pt };
export type Locale = keyof typeof localeDicts;

export type NestedLocaleKeys<T> = T extends (...args: any[]) => any
  ? never
  : T extends object
    ? {
        [K in keyof T & (string | number)]: T[K] extends (...args: any[]) => any
          ? `${K}`
          : T[K] extends object
            ? `${K}.${NestedLocaleKeys<T[K]>}`
            : `${K}`;
      }[keyof T & (string | number)]
    : never;

export type TranslationKey = NestedLocaleKeys<typeof en>;

export type TranslationArgs<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? TranslationArgs<T[Key], Rest>
    : []
  : P extends keyof T
    ? T[P] extends (...args: infer A) => any
      ? A
      : []
    : [];

export type TranslationFunc = <K extends TranslationKey>(
    key: K,
    ...args: TranslationArgs<typeof en, K>
  ) => string;

