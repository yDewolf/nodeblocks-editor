import en from "./langs/en";
import pt from "./langs/pt";

export const localeDicts = { en, pt };
export type Locale = keyof typeof localeDicts;

export type NestedLocaleKeys<T> = T extends object
? {
    [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedLocaleKeys<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)]
: never;

export type TranslationKey = NestedLocaleKeys<typeof en>;