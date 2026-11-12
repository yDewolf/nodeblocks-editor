import { createEffect, createSignal, Match, onCleanup, onMount, ParentComponent, Show, Switch } from "solid-js";
import { RemoteServerConfigForm } from "./remote-server-setup";
import { LocalServerSetupContent } from './setup-screen';
import "~/style/screens/setup/setup.css";
import { appSettings, setSetupComplete } from "../app-settings";
import { useAppSession } from "~/network/app-session-provider";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useI18n } from "~/i18n/i18n-context";

type WizardSteps = "start" | "local" | "remote";

export const SetupWizard: ParentComponent<{

}> = (props) => {
    const {t} = useI18n();
    const appSession = useAppSession();
    const [step, setStep] = createSignal<WizardSteps>("start");
    
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    
    const [isLocalServerInstalled, setLocalServerInstalled] = createSignal<boolean>(false);

    const [logs, setLogs] = createSignal<string[]>([]);

    const [isLocalRunning, setLocalRunning] = createSignal(false);
    if (window.isTauriEnvironment) {
        onMount(async () => {
            const is_installed = await invoke<boolean>("check_server_installed");
            setLocalServerInstalled(is_installed);
            const is_running = await invoke<boolean>("is_local_server_running");
            setLocalRunning(is_running);
        });

        onMount(async () => {
            const unlisten = await listen<string>("server-log", (event) => {
                setLogs((prev) => [...prev, event.payload]);
            });

            onCleanup(() => {
                unlisten();
            });
        });
    }

    // TODO: fazer um controller para o servidor local que armazena logs e etc
    const [serverStarting, setServerStarting] = createSignal(false);
    const handleStartLocalServer = async () => {
        setServerStarting(true);
        try {
            await invoke("start_local_server");
            setLocalRunning(true);
            // FIXME: trocar isso aqui por porta dinâmica
            setTimeout(() => {
                appSession.tryConnectToServer("127.0.0.1", 8080);
            }, 1500);
        } catch (err: any) {
            console.error("Failed to start local server:", err);
        } finally {
            setServerStarting(false);
        }
    };

    return (
        <Show when={isMounted()}>
            <div class="setup-wizard container">
                <div class="setup-wizard-content text-section container fill">
                    <h2 class="setup-title">Nodeblocks Setup</h2>
                    <div class="container fill">
                        <Switch>
                            <Match when={step() == "start" }>
                                <div>
                                    <h3>{t("pages.settings.setupWizard.start.title")}</h3>
                                    <p>
                                        {t("pages.settings.setupWizard.start.description")}
                                    </p>
                                    <Show when={appSession.isConnectedToServer}>
                                        <p><b>{t("words.note")}</b> {t("pages.settings.setupWizard.messages.alreadyConnected", appSession.baseHttpUrl)}</p>
                                    </Show>
                                    
                                    <div class="setup-options">
                                        <Show when={isLocalServerInstalled()} fallback={
                                            <button class="text-button" onClick={() => setStep("local")}>
                                                {t("pages.settings.setupWizard.start.installLocally")}
                                            </button>

                                        }>
                                            <button class="text-button" onClick={handleStartLocalServer}
                                                disabled={serverStarting()}
                                            >
                                                {serverStarting() ? "Starting..." : "Start local server"}
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
                                            setLocalServerInstalled(true);
                                        }} 
                                    />
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
                        }} disabled={!appSession.isConnectedToServer}>
                            {t("pages.settings.setupWizard.finishSetup")}
                        </button>
                    </div>
                    <Show when={isLocalRunning()}>
                        <details>
                            <summary>{t("pages.settings.setupWizard.serverOutput")}</summary>
                            <pre>{logs().join("\n")}</pre>
                        </details>
                    </Show>
                </div>
            </div>
        </Show>
    )
}


export const SetupScreen: ParentComponent = (props) => {
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    return (
        <Show when={isMounted()}>
            <Show when={appSettings.isSetupComplete || !window.isTauriEnvironment} fallback={
                <SetupWizard/>
            }>
                {props.children}
            </Show>
        </Show>
    )
}