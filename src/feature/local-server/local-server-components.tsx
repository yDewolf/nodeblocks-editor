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

export const LocalServerPanel = () => {
    const {t} = useI18n();
    const appSession = useAppSession();
    return (
        <div class="text-section">
            <h3>{t("components.localServerPanel.title")}</h3>
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
            
            <div class="row-container">
                <Show when={localServerController.isRunning} fallback={
                    <button class="text-button" onclick={() => {
                        localServerController.startServer()
                    }}
                        disabled={localServerController.isStarting}
                    >
                        {localServerController.isStarting ? t("pages.settings.setupWizard.start.startingLocal") : t("pages.settings.setupWizard.start.startLocal")}
                    </button>
                }>
                    <button class="text-button" onclick={() => {
                        localServerController.stopServer();
                    }}>
                        {t("components.localServerPanel.stopServer")}
                    </button>
                    <button class="text-button" onclick={() => {
                        appSession.tryConnectToServer("127.0.0.1", 8080);
                    }}>
                        {t("components.localServerPanel.connectToLocalServer")}
                    </button>
                </Show>
            </div>
            <LocalServerLogs/>
        </div>
    )
}