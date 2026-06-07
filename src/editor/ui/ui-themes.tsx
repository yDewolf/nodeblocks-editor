import { makePersisted } from "@solid-primitives/storage";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

export type Theme = "light" | "dark" | "auto";
interface ThemeStore {
    theme: Theme
}

const getSystemTheme = (): Theme => {
    if (isServer) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const [themeStore, _setTheme] = makePersisted(
    createStore<ThemeStore>({
        theme: getSystemTheme(),
    }), 
    {name: "app-theme"}
);

export const UpdateRootDataTheme = () => {
    const root = document.documentElement;
    const currentTheme = themeStore.theme;
    
    root.setAttribute("data-theme", currentTheme != "auto" ? currentTheme : getSystemTheme());
    _setTheme("theme", currentTheme);
}

export const getCurrentTheme = () => themeStore.theme;
export const toggleTheme = () => _setTheme("theme", themeStore.theme === "light" ? "dark" : "light")
export const setTheme = (theme: Theme) => _setTheme("theme", theme)
