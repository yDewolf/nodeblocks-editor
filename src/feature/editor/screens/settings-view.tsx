import { For } from "solid-js"
import { PageViewer } from "../../../components/page-controller"
import { appSettings, setTheme } from "~/feature/app-settings";
import { getCurrentTheme } from "~/feature/app-settings";
import { THEMES } from "~/feature/app-settings";
import { Theme } from "~/feature/app-settings";
import { editorSettings, setAlwaysShowSlotLabels } from "../editor-settings";
import { useI18n } from "~/i18n/i18n-context";
import { Locale, localeDicts } from "~/i18n/i18n-locale";

// TODO: improve this page
export const EditorSettingsView = (props: {page_viewer: PageViewer}) => {
    let containerRef: HTMLDivElement | undefined
    return (
        <div ref={containerRef} class="container padded settings-page" onFocusOut={(e) => {
            const nextTarget = e.relatedTarget as Node
            if (nextTarget && !containerRef?.contains(nextTarget)) {
                props.page_viewer.current_page = undefined;
            }
        }}>
            <EditorSettingsContent />
        </div>
    )
}

export const EditorSettingsContent = () => {
    const { t, setLocale } = useI18n();
    return (
        <div class="field-grid-holder">
            <div class="field-grid">
                <label class="field-label" for="settings-theme">{t("pages.settings.editor.theme")}</label>
                <select id="settings-theme" 
                    value={getCurrentTheme()} 
                    onchange={(e) => {
                        setTheme(e.currentTarget.value as Theme)
                }}>
                    <For each={THEMES}>
                        {(theme) => <option value={theme}>{t(`themes.${theme as Theme}`)}</option>}
                    </For>
                </select>
            </div>
            <div class="field-grid">
                <label class="field-label" for="settings-lang">{t("pages.settings.editor.lang")}</label>
                <select id="settings-lang" 
                    value={appSettings.locale} 
                    onchange={(e) => {
                        setLocale(e.target.value as Locale);
                }}>
                    <For each={Object.keys(localeDicts)}>
                        {(locale) => <option value={locale}>{t(`locale.${locale as Locale}`)}</option>}
                    </For>
                </select>
            </div>
            <div class="field-grid">
                <label for="settings-alwaysShowSlotLabel" class="field-label">{t("pages.settings.editor.alwaysShowSlotLabels")}</label>
                <input type="checkbox" id="settings-alwaysShowSlotLabel" 
                    checked={editorSettings.alwaysShowSlotLabels}
                    onchange={(e) => setAlwaysShowSlotLabels(e.target.checked)}
                />
            </div>
        </div>
    )
}

