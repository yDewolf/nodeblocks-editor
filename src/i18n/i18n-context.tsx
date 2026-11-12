import { createContext, useContext, createMemo, ParentComponent } from "solid-js";
import { translator, flatten } from "@solid-primitives/i18n";
import { appSettings, defaultSystemLanguage, setLocale } from "~/feature/app-settings";
import { localeDicts, Locale, TranslationFunc } from "./i18n-locale";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationFunc
};

const I18nContext = createContext<I18nContextType>();

export const I18nProvider: ParentComponent = (props) => {
    const defaultLocale = defaultSystemLanguage();
    if (!appSettings.locale) {
        setLocale(defaultLocale);
    }
    const localeDict = localeDicts[appSettings.locale || defaultLocale];
    const dict = createMemo(() => flatten(localeDict));
    const translate = translator(dict);

    return (
        <I18nContext.Provider value={{ locale: appSettings.locale, setLocale, t: translate as any}}>
            {props.children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used within an I18nProvider");
    return context;
};
