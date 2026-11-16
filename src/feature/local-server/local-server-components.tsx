import { invoke } from "@tauri-apps/api/core";
import { Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context"
import { localServerController, LocalServerStates } from "~/network/api/local-server-controller";
import { useAppSession } from "~/network/app-session-provider";

export const LocalServerLogs = () => {
    const {t} = useI18n();
    return (
        <details>
            <summary>{t("components.localServerPanel.serverOutput")}</summary>
            <pre>{localServerController.logs.join("\n")}</pre>
        </details>
    )
}

export const LocalServerPanel = (props: {
    showTitle?: boolean
}) => {
    const {t} = useI18n();
    const appSession = useAppSession();
    return (
        <div class="text-section">
            <Show when={props.showTitle}>
                <h3>{t("components.localServerPanel.title")}</h3>
            </Show>
            <div class="field-grid">
                <label for="">{t("components.localServerPanel.serverVersion")}</label>
                <input type="text" disabled={true} value={
                    localServerController.installedVersion
                } />
            </div>
            <div class="field-grid">
                <label for="">{t("components.localServerPanel.serverStatus")}</label>
                <input type="text" disabled={true} value={
                    t(`components.localServerPanel.${localServerController.state.toString() as LocalServerStates}`)
                } />
            </div>
            <OpenPluginsButton />
            <div class="row-container">
                <Show when={localServerController.isRunning} fallback={
                    <button class="text-button" onclick={() => {
                        localServerController.startServer()
                    }}
                        disabled={localServerController.isStarting}
                    >
                        {localServerController.isStarting ? t("components.localServerPanel.startingLocal") : t("components.localServerPanel.startLocal")}
                    </button>
                }>
                    <button class="text-button" onclick={async () => {
                        await localServerController.stopServer();
                        localServerController.startServer();
                    }}>
                        {t("components.localServerPanel.restartServer")}
                    </button>
                    <button class="text-button" onclick={() => {
                        localServerController.stopServer();
                    }}>
                        {t("components.localServerPanel.stopServer")}
                    </button>
                    <button class="text-button" onclick={() => {
                            appSession.tryConnectToServer("127.0.0.1", 8080);
                        }}
                        disabled={(appSession.host == "127.0.0.1" || appSession.host == "localhost") && appSession.isConnectedToServer}
                    >
                        {t("components.localServerPanel.connectToLocalServer")}
                    </button>
                </Show>
            </div>
            <LocalServerLogs/>
        </div>
    )
}

export const OpenPluginsButton = () => {
    const {t} = useI18n();
    const handleOpenPluginsFolder = async () => {
        try {
            await invoke("open_plugins_folder");
        } catch (error) {
            console.error("Failed to open plugins folder", error);
        }
    };

    return (
        <button 
            class="text-button"
            onClick={handleOpenPluginsFolder}
        >
            {t("components.localServerPanel.openPluginsFolder")}
        </button>
    );
}