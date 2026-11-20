import { useSetup } from "../setup-wizard-context";
import { createSignal, Show } from "solid-js";
import { localServerController } from "~/network/api/local-server-controller";
import { useAppSession } from "~/network/app-session-provider";
import { LocalServerLogs } from "~/feature/local-server/local-server-components";
import { AutoStartLocalField } from "~/feature/home/settings/app-settings-view";
import { useI18n } from "~/i18n/i18n-context";

export const LocalServerSetup = () => {
    const wizard = useSetup();
    const {t} = useI18n();
    const appSession = useAppSession();

    const [successfulConnection, setSuccessfulConnection] = createSignal<boolean>(false);
    const [testing, setTesting] = createSignal<boolean>(false);
    const handleStartLocalTest = async () => {
        if (testing()) return;
        
        setTesting(true);
        if (!localServerController.isRunning) {
            await localServerController.startServer();
        }
        const successful = await appSession.tryConnectToServer(localServerController.host, localServerController.port);
        setSuccessfulConnection(successful);
        setTesting(false);
    }

    return (
        <>
            <p>{t("pages.setupWizard.localTest.beforeContinuingMessage")}</p>
            <div class="field-grid">
                <AutoStartLocalField/>
            </div>
            <p class="note">{t("pages.setupWizard.messages.youCanChangeThisLater")}</p>
            <br />
            <button class="text-button"
                onclick={handleStartLocalTest}
                disabled={testing() || successfulConnection()}
            >
                {successfulConnection() ? t("pages.setupWizard.localTest.localTestsPassed"): testing() 
                ? t("pages.setupWizard.localTest.testingConnection") : t("pages.setupWizard.localTest.runLocalTests")}
            </button>
            <Show when={successfulConnection()}>
                <p>{t("pages.setupWizard.localTest.connectedSuccessfully")} <b>{t("pages.setupWizard.messages.youCanProceed")}</b></p>
            </Show>
            <LocalServerLogs/>
        </>
    );
}