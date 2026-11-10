import { createSignal, onMount, ParentComponent, Show } from "solid-js"
import { appSettings } from "~/feature/app-settings";
import { EditorSettingsContent } from "~/feature/editor/screens/settings-view";
import "~/style/screens/settings.css";

export const SettingsRoute: ParentComponent = (props) => {
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    const [serverHost, setServerHost] = createSignal<string>(appSettings.serverHost);
    const [serverPort, setServerPort] = createSignal<number>(appSettings.serverPort);

    return (
        <Show when={isMounted()}>
            <div class="settings-view">
                <h4>Settings</h4>
                <div class="settings-view-content container fill">
                    <div class="text-section">
                        <h3>General Settings</h3>
                        <div class="field-grid">
                            <label class="field-label" for="settings-serverHost">Server HOST</label>
                            <input class="field-input" type="text" id="settings-serverHost"
                                value={serverHost()}
                                oninput={(e) => setServerHost(e.target.value)}
                            />
                        </div>
                        <div class="field-grid">
                            <label class="field-label" for="settings-serverPort">Server PORT</label>
                            <input class="field-input" type="number" max={65536} min={0} incremental={true} id="settings-serverPort"
                                value={serverPort()}
                                oninput={(e) => setServerPort(Number.parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div class="text-section">
                        <h3>Editor Settings</h3>
                        <EditorSettingsContent/>
                    </div>
                    {props.children}
                </div>
            </div>
        </Show>
    )
}