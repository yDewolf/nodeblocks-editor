import { createSignal, onMount, ParentComponent, Show } from "solid-js"
import { EditorSettingsContent } from "~/feature/editor/screens/settings-view";
import "~/style/screens/settings.css";
import { RemoteServerConfigForm } from '../../setup/remote-server-setup';
import { setSetupComplete } from "~/feature/app-settings";
import { useI18n } from "~/i18n/i18n-context";
import { LocalServerPanel } from "~/feature/local-server/local-server-components";

export const SettingsRoute: ParentComponent = (props) => {
    const { t } = useI18n();
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    return (
        <Show when={isMounted()}>
            <div class="settings-view">
                <h4>{t("pages.settings.title")}</h4>
                <div class="settings-view-content container fill">
                    <div class="text-section">
                        <h3>{t("pages.settings.generalTitle")}</h3>
                        <RemoteServerConfigForm />
                    </div>
                    <hr style={{margin: "20px 0"}}/>
                    <div class="text-section">
                        <h3>{t("pages.settings.editorTitle")}</h3>
                        <EditorSettingsContent/>
                    </div>
                    <hr style={{margin: "20px 0"}}/>
                    {/* placeholder */}
                    <Show when={window.isTauriEnvironment}>
                        <button class="text-button" onclick={() => {
                            setSetupComplete(false);
                        }}>
                            {t("pages.settings.openSetupWizard")}
                        </button>
                        <hr style={{margin: "20px 0"}}/>
                        <LocalServerPanel/>
                    </Show>
                    {props.children}
                </div>
            </div>
        </Show>
    )
}