import { PageViewer } from "../components/page-controller"
import { getCurrentTheme, setTheme, Theme } from "../ui-themes"

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
                        <option value="auto">Auto</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>
        </div>
    )
}