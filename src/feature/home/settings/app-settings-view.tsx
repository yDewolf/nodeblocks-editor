import { For } from "solid-js"
import { appSettings, getCurrentTheme, setAutoStartLocal, setTheme, Theme, THEMES } from "~/feature/app-settings"
import { useI18n } from "~/i18n/i18n-context"
import { Locale, localeDicts } from "~/i18n/i18n-locale"

export const AppSettingsContent = () => {
    return (
        <>
            <div class="field-grid">
                <ThemeSelectorField/>
            </div>
            <div class="field-grid">
                <LangSelectField/>
            </div>
            <div class="field-grid">
                <AutoStartLocalField/>
            </div>
        </>
    )
}

// -- theme

export const ThemeSelector = () => {
    const { t } = useI18n();
    return (
        <select id="settings-theme"
            value={getCurrentTheme()}
            onchange={(e) => {
                setTheme(e.currentTarget.value as Theme);
            } }>
            <For each={THEMES}>
                {(theme) => <option value={theme}>{t(`themes.${theme as Theme}`)}</option>}
            </For>
        </select>
    );
};

export const ThemeSelectorField = () => {
    const { t } = useI18n();
    return (<>
        <label class="field-label" for="settings-theme">{t("pages.settings.editor.theme")}</label>
        <ThemeSelector />
    </>);
};

// -- lang

export const LangSelectField = () => {
    const { t } = useI18n();
    return (<>
        <label class="field-label" for="settings-lang">{t("pages.settings.editor.lang")}</label>
        <LangSelector/>
    </>)
}

export const LangSelector = () => {
    const { t, setLocale } = useI18n();
    return (
        <select id="settings-lang" 
            value={appSettings.locale} 
            onchange={(e) => {
                setLocale(e.target.value as Locale);
        }}>
            <For each={Object.keys(localeDicts)}>
                {(locale) => <option value={locale}>{t(`locale.${locale as Locale}`)}</option>}
            </For>
        </select>
    )
}

// -- local server

export const AutoStartLocalField = () => {
    return <>
        <label for="auto-start-local">Start local server on app startup</label>
        <input class="field-input" type="checkbox" id="auto-start-local"
            checked={appSettings.autoStartLocalServer} oninput={(e) => {
                setAutoStartLocal(e.target.checked);
            }}
        />
    </>
}