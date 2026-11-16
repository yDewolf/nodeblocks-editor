import { For, Show } from "solid-js"
import { PageViewer } from "../../../components/page-controller"
import { appSettings, setTheme } from "~/feature/app-settings";
import { getCurrentTheme } from "~/feature/app-settings";
import { THEMES } from "~/feature/app-settings";
import { Theme } from "~/feature/app-settings";
import { editorSettings, setAlwaysShowSlotLabels } from "../editor-settings";
import { useI18n } from "~/i18n/i18n-context";
import { Locale, localeDicts } from "~/i18n/i18n-locale";
import { DefaultNodePreview, NodePreview } from "~/feature/scene/components/node/node-previews";

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

export const EditorSettingsContent = (props: {
    withPreview?: boolean
}) => {
    const { t } = useI18n();
    return (
        <>
            <div class="field-grid-holder">
                <div class="field-grid">
                    <label for="settings-alwaysShowSlotLabel" class="field-label">{t("pages.settings.editor.alwaysShowSlotLabels")}</label>
                    <input type="checkbox" id="settings-alwaysShowSlotLabel" 
                        checked={editorSettings.alwaysShowSlotLabels}
                        onchange={(e) => setAlwaysShowSlotLabels(e.target.checked)}
                    />
                </div>
            </div>
            <Show when={props.withPreview}>
                <hr />
                <h3>{t("words.preview")}</h3>
                <div class="row-container preview-holder">
                    <div style={{"z-index": 2}}>
                        <div style={{"max-width": "200px"}}>
                            <DefaultNodePreview show_slot_labels={false}/>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    )
}

export const ThemeSelectorField = () => {
    const { t } = useI18n();
    return (<>
        <label class="field-label" for="settings-theme">{t("pages.settings.editor.theme")}</label>
        <ThemeSelector/>
    </>)
}

export const ThemeSelector = () => {
    const { t } = useI18n();
    return (
        <select id="settings-theme" 
            value={getCurrentTheme()} 
            onchange={(e) => {
                setTheme(e.currentTarget.value as Theme)
        }}>
            <For each={THEMES}>
                {(theme) => <option value={theme}>{t(`themes.${theme as Theme}`)}</option>}
            </For>
        </select>
    )
}


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