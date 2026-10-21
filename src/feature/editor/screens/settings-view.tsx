import { For } from "solid-js"
import { PageViewer } from "../../../components/page-controller"
import { getCurrentTheme, setTheme, Theme, THEMES } from '../../ui-themes';

// TODO: improve this page
export const SettingsView = (props: {page_viewer: PageViewer}) => {
    return (
        <div class="container padded settings-page" onFocusOut={() => props.page_viewer.current_page = undefined}>
            <div class="field-grid-holder">
                <div class="field-grid">
                    <span class="field-label">Theme</span>
                    <select name="theme" id="theme" 
                        value={getCurrentTheme()} 
                        onchange={(e) => {
                            setTheme(e.currentTarget.value as Theme)
                    }}>
                        <For each={THEMES}>
                            {(theme) => <option value={theme}>{theme}</option>}
                        </For>
                    </select>
                </div>
            </div>
        </div>
    )
}