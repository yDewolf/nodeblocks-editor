import { createContext, useContext, createSignal, createMemo, ParentComponent } from "solid-js";
import { translator, flatten, Translator, BaseRecordDict } from "@solid-primitives/i18n";
import { appSettings, setLocale } from "~/feature/app-settings";
import { localeDicts, Locale } from "./i18n-locale";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator<BaseRecordDict, string>;
};

const I18nContext = createContext<I18nContextType>();

export const I18nProvider: ParentComponent = (props) => {
  const dict = createMemo(() => flatten(localeDicts[appSettings.locale]));
  const translate = translator(dict);

  return (
    <I18nContext.Provider value={{ locale: appSettings.locale, setLocale, t: translate }}>
      {props.children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
};
