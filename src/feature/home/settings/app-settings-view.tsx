import { LangSelectField, ThemeSelectorField } from "~/feature/editor/screens/settings-view"

export const AppSettingsContent = () => {
    return (
        <>
            <div class="field-grid">
                <ThemeSelectorField/>
            </div>
            <div class="field-grid">
                <LangSelectField/>
            </div>
        </>
    )
}