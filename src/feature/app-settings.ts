import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";
import { Locale, localeDicts } from "~/i18n/i18n-locale";

export type Theme = "light" | "dark" | "dark-contrast" | "auto";
export const THEMES = ["light", "dark", "dark-contrast", "auto"];

interface AppSettings {
    isSetupComplete: boolean
    locale: Locale
    theme: Theme
}

const getSystemTheme = (): Theme => {
    if (isServer) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getSystemLanguage = (): string => {
  return navigator.language || (navigator as any).userLanguage || "en";
};

const getShortSystemLanguage = (): string => {
  const fullLang = getSystemLanguage();
  return fullLang.split("-")[0];
};

const [appSettings, _setAppSettings] = makePersisted(
    createStore<AppSettings>({
        isSetupComplete: false,
        locale: new Map(Object.entries(localeDicts)).get(getShortSystemLanguage()) as Locale || "en",
        theme: getSystemTheme(),
    }), 
    {name: "app-settings"}
);

export const setLocale = (l: Locale) => _setAppSettings("locale", l);
export const setSetupComplete = (v: boolean) => _setAppSettings("isSetupComplete", v);
export { appSettings }

export const getCurrentTheme = () => appSettings.theme;

export const setTheme = (theme: Theme) => _setAppSettings("theme", theme);
export const toggleTheme = () => setTheme(appSettings.theme === "light" ? "dark" : "light");

export const UpdateRootDataTheme = () => {
    const root = document.documentElement;
    const currentTheme = appSettings.theme;

    root.setAttribute("data-theme", currentTheme != "auto" ? currentTheme : getSystemTheme());
    setTheme(currentTheme);
};
