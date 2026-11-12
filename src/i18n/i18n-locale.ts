import en from "./langs/en";
import pt from "./langs/pt";

export const localeDicts = { en, pt };
export type Locale = keyof typeof localeDicts;
