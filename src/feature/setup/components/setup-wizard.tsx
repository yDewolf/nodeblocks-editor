import { ParentComponent, createSignal, onMount, Show, Switch, Match } from "solid-js";
import { setSetupComplete } from "~/feature/app-settings";
import { LocalServerLogs } from "~/feature/local-server/local-server-components";
import { useI18n } from "~/i18n/i18n-context";
import { localServerController } from "~/network/api/local-server-controller";
import { useAppSession } from "~/network/app-session-provider";
import { WizardSteps } from "../setup-route";
import { RemoteServerConfigForm } from "./remote-server-connect-form";
import { LocalServerSetupContent } from "./local-server-setup";


export const SetupWizard: ParentComponent<{}> = (props) => {
    const { t } = useI18n();
    const appSession = useAppSession();
    const [step, setStep] = createSignal<WizardSteps>("start");

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    const handleStartLocalServer = async () => {
        await localServerController.startServer();
        appSession.tryConnectToServer("127.0.0.1", 8080);
    };

    return (
        <Show when={isMounted()}>
            <div class="setup-wizard container">
                <div class="setup-wizard-content text-section container fill">
                    <h2 class="setup-title">{t("pages.settings.setupWizard.title")}</h2>
                    <div class="container fill">
                        <Switch>
                            <Match when={step() == "start"}>
                                <div>
                                    <h3>{t("pages.settings.setupWizard.start.title")}</h3>
                                    <p>
                                        {t("pages.settings.setupWizard.start.description")}
                                    </p>
                                    <Show when={appSession.isConnectedToServer}>
                                        <p><b>{t("words.note")}</b> {t("pages.settings.setupWizard.messages.alreadyConnected", appSession.baseHttpUrl)}</p>
                                    </Show>

                                    <div class="setup-options">
                                        <Show when={localServerController.isInstalled} fallback={<button class="text-button" onClick={() => setStep("local")}>
                                            {t("pages.settings.setupWizard.start.installLocally")}
                                        </button>}>
                                            <button class="text-button" onClick={handleStartLocalServer}
                                                disabled={localServerController.isStarting || localServerController.isRunning}
                                            >
                                                {localServerController.isStarting ? t("pages.settings.setupWizard.start.startingLocal") : t("pages.settings.setupWizard.start.startLocal")}
                                            </button>
                                        </Show>
                                        <button class="text-button" onClick={() => setStep("remote")}>
                                            {t("pages.settings.setupWizard.start.connectToRemote")}
                                        </button>
                                    </div>
                                </div>
                            </Match>
                            <Match when={step() === "local"}>
                                <div>
                                    <button class="text-button" onClick={() => setStep("start")}>
                                        {t("actions.goBack")}
                                    </button>
                                    <LocalServerSetupContent
                                        onReady={() => {
                                            localServerController.checkIsInstalled();
                                        } } />
                                </div>
                            </Match>
                            <Match when={step() === "remote"}>
                                <div>
                                    <button class="text-button go-back" onClick={() => setStep("start")}>
                                        {t("actions.goBack")}
                                    </button>
                                    <RemoteServerConfigForm />
                                </div>
                            </Match>
                        </Switch>
                    </div>
                    <div class="setup-actions">
                        <button class="text-button" onclick={() => {
                            setSetupComplete(true);
                        } } disabled={!appSession.isConnectedToServer}>
                            {t("pages.settings.setupWizard.finishSetup")}
                        </button>
                    </div>
                    <Show when={localServerController.isRunning}>
                        <LocalServerLogs />
                    </Show>
                </div>
            </div>
        </Show>
    );
};
