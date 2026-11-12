import { createSignal } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";
import { useAppSession } from "~/network/app-session-provider";

export const RemoteServerConfigForm = () => {
    const { t } = useI18n();
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
                <label class="field-label" for="settings-serverHost">{t("pages.settings.remoteHost.hostLabel")}</label>
                <input class="field-input" type="text" id="settings-serverHost"
                    value={serverHost()}
                    oninput={(e) => setServerHost(e.target.value)}
                    />
            </div>
            <div class="field-grid">
                <label class="field-label" for="settings-serverPort">{t("pages.settings.remoteHost.portLabel")}</label>
                <input class="field-input" type="number" max={65536} min={0} incremental={true} id="settings-serverPort"
                    value={serverPort()}
                    oninput={(e) => setServerPort(Number.parseInt(e.target.value))}
                    />
            </div>
            <span>{t("pages.settings.remoteHost.status", 
                (appSession.isConnectedToServer ? t("pages.settings.remoteHost.serverStatusAlive") : t("pages.settings.remoteHost.serverStatusDisconnected")), 
                appSession.baseHttpUrl
            )}</span>
            <button type="submit" class="text-button"
                disabled={connecting()}
                >
                {connecting() ? t("pages.settings.remoteHost.connecting") : t("pages.settings.remoteHost.connect")}
            </button>
        </form>
    )
}