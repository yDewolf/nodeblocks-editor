import { Show } from "solid-js"
import { PageViewer } from "../../../components/page-controller"
import { editorSettings, setAlwaysShowSlotLabels } from "../editor-settings";
import { useI18n } from "~/i18n/i18n-context";
import { DefaultNodePreview } from "~/feature/scene/components/node/node-previews";

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
    const withPreview = props.withPreview ?? true;
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
            <Show when={withPreview}>
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
