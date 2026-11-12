import { createContext, useContext, createSignal, createMemo, ParentComponent } from "solid-js";
import { translator, flatten, Translator, BaseRecordDict } from "@solid-primitives/i18n";
import { appSettings, defaultSystemLanguage, getShortSystemLanguage, setLocale } from "~/feature/app-settings";
import { localeDicts, Locale } from "./i18n-locale";
import { isServer } from "solid-js/web";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator<BaseRecordDict, string>;
};

const I18nContext = createContext<I18nContextType>();

export const I18nProvider: ParentComponent = (props) => {
    const defaultLocale = defaultSystemLanguage();
    if (!appSettings.locale) {
        setLocale(defaultLocale);
    }
    const localeDict = localeDicts[appSettings.locale || defaultLocale];
    console.log(localeDict);
    const dict = createMemo(() => flatten(localeDicts));
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
