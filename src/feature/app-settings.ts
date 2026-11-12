import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

export type Theme = "light" | "dark" | "dark-contrast" | "auto";
export const THEMES = ["light", "dark", "dark-contrast", "auto"];

interface AppSettings {
    isSetupComplete: boolean
    theme: Theme
}

const getSystemTheme = (): Theme => {
    if (isServer) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};


const [appSettings, _setAppSettings] = makePersisted(
    createStore<AppSettings>({
        isSetupComplete: false,
        theme: getSystemTheme(),
    }), 
    {name: "app-settings"}
);

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
