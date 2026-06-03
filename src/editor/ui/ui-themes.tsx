import { makePersisted } from "@solid-primitives/storage";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

export type Theme = "light" | "dark";
interface ThemeStore {
    theme: Theme
}

const getSystemTheme = (): Theme => {
    if (isServer) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const [themeStore, setTheme] = makePersisted(
    createStore<ThemeStore>({
        theme: getSystemTheme()
    }), 
    {name: "app-theme"}
);
createEffect(() => {
    const root = document.documentElement;
    const currentTheme = themeStore.theme;
    
    root.setAttribute("data-theme", currentTheme);
    setTheme("theme", currentTheme);
});

export const toggleTheme = () => setTheme("theme", themeStore.theme === "light" ? "dark" : "light");