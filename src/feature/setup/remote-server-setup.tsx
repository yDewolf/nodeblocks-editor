import { createSignal, onCleanup } from "solid-js";
import { useAppSession } from "~/network/app-session-provider";

export const RemoteServerConfigForm = () => {
    const appSession = useAppSession();
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
            <span>Server Status: {appSession.isConnectedToServer ? "alive" : "disconnected"} ({appSession.baseHttpUrl})</span>
            <button type="submit" class="text-button"
                disabled={connecting()}
                >
                {connecting() ? "Connecting..." : "Connect to Server"}
            </button>
        </form>
    )
}