import { createSign } from "node:crypto";
import { createSignal, onMount, ParentComponent, Show } from "solid-js"
import { EditorSettingsContent } from "~/feature/editor/screens/settings-view";
import { useAppSession } from "~/network/app-session-provider";
import "~/style/screens/settings.css";

export const SettingsRoute: ParentComponent = (props) => {
    const appSession = useAppSession();

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    const [serverHost, setServerHost] = createSignal<string>(appSession.host);
    const [serverPort, setServerPort] = createSignal<number>(appSession.port);
    const [connecting, setConnecting] = createSignal<boolean>(false);
    const handleConnectToServer = (e: Event) => {
        setConnecting(true);
        appSession.tryConnectToServer(serverHost(), serverPort()).then(() => {
            setConnecting(false);
        });
        e.preventDefault();
    }

    return (
        <Show when={isMounted()}>
            <div class="settings-view">
                <h4>Settings</h4>
                <div class="settings-view-content container fill">
                    <div class="text-section">
                        <h3>General Settings</h3>
                        <form class="container fill" onsubmit={handleConnectToServer}>
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
                            <button type="submit" class="text-button"
                                disabled={connecting()}
                            >
                                {connecting() ? "Connecting..." : "Connect to Server"}
                            </button>
                        </form>
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