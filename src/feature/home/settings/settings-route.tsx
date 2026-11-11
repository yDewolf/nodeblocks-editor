import { createSignal, onMount, ParentComponent, Show } from "solid-js"
import { EditorSettingsContent } from "~/feature/editor/screens/settings-view";
import { useAppSession } from "~/network/app-session-provider";
import "~/style/screens/settings.css";
import { RemoteServerConfigForm } from '../../setup/remote-server-setup';
import { setSetupComplete } from "~/feature/app-settings";

export const SettingsRoute: ParentComponent = (props) => {
    const appSession = useAppSession();
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    return (
        <Show when={isMounted()}>
            <div class="settings-view">
                <h4>Settings</h4>
                <div class="settings-view-content container fill">
                    <div class="text-section">
                        <h3>General Settings</h3>
                        <RemoteServerConfigForm />
                    </div>
                    <div class="text-section">
                        <h3>Editor Settings</h3>
                        <EditorSettingsContent/>
                    </div>

                    {/* placeholder */}
                    <Show when={window.isTauriEnvironment}>
                        <button class="text-button" onclick={() => {
                            setSetupComplete(false);
                        }}>
                            Open Setup Wizard
                        </button>
                    </Show>
                    {props.children}
                </div>
            </div>
        </Show>
    )
}