import { For } from "solid-js"
import { PageViewer } from "../../../components/page-controller"
import { getCurrentTheme, setTheme, Theme, THEMES } from '../../ui-themes';
import { editorSettings, setAlwaysShowSlotLabels } from "../editor-settings";

// TODO: improve this page
export const SettingsView = (props: {page_viewer: PageViewer}) => {
    let containerRef: HTMLDivElement | undefined
    return (
        <div ref={containerRef} class="container padded settings-page" onFocusOut={(e) => {
            const nextTarget = e.relatedTarget as Node
            if (nextTarget && !containerRef?.contains(nextTarget)) {
                props.page_viewer.current_page = undefined
            }
        }}>
            <div class="field-grid-holder">
                <div class="field-grid">
                    <label class="field-label" for="settings-theme">Theme</label>
                    <select id="settings-theme" 
                        value={getCurrentTheme()} 
                        onchange={(e) => {
                            setTheme(e.currentTarget.value as Theme)
                    }}>
                        <For each={THEMES}>
                            {(theme) => <option value={theme}>{theme}</option>}
                        </For>
                    </select>
                </div>
                <div class="field-grid">
                    <label for="settings-alwaysShowSlotLabel" class="field-label">Always Show Slot Labels</label>
                    <input type="checkbox" id="settings-alwaysShowSlotLabel" 
                        checked={editorSettings.alwaysShowSlotLabels}
                        onchange={(e) => setAlwaysShowSlotLabels(e.target.checked)}
                    />
                </div>
            </div>
        </div>
    )
}