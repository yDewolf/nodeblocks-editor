import { Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";
import { _setSetupComplete } from "../app-settings";
import { LocalServerPanel } from "./local-server-components";

export const LocalServerSettingsContent = () => {
    const { t } = useI18n();
    return (
        <Show when={window.isTauriEnvironment}>
            <button class="text-button" onclick={() => {
                _setSetupComplete(false);
            }}>
                {t("pages.settings.openSetupWizard")}
            </button>
            <LocalServerPanel showTitle={true}/>
        </Show>
    )
}