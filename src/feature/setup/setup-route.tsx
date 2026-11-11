import { createEffect, createSignal, Match, onCleanup, onMount, ParentComponent, Show, Switch } from "solid-js";
import { RemoteServerConfigForm } from "./remote-server-setup";
import { LocalServerSetupContent } from './setup-screen';
import "~/style/screens/setup/setup.css";
import { appSettings, setSetupComplete } from "../app-settings";
import { useAppSession } from "~/network/app-session-provider";
import { invoke } from "@tauri-apps/api/core";

type WizardSteps = "start" | "local" | "remote";

export const SetupWizard: ParentComponent<{

}> = (props) => {
    const appSession = useAppSession();
    const [step, setStep] = createSignal<WizardSteps>("start");
    
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    
    const [isLocalServerInstalled, setLocalServerInstalled] = createSignal<boolean>(false);

    if (window.isTauriEnvironment) {
        onMount(async () => {
            const is_installed = await invoke<boolean>("check_server_installed");
            setLocalServerInstalled(is_installed);
        });
    }

    const handleStartLocalServer = () => {

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
                                    <h3>How would you like to run nodeblocks?</h3>
                                    <p>
                                        You can install the server and run it locally or connect to a remote server.
                                    </p>
                                    <Show when={appSession.isConnectedToServer}>
                                        <p><b>Note:</b> you are already connected to: {appSession.baseHttpUrl}</p>
                                    </Show>
                                    
                                    <div class="setup-options">
                                        <Show when={isLocalServerInstalled()} fallback={
                                            <button class="text-button" onClick={() => setStep("local")}>
                                                Install server locally
                                            </button>

                                        }>
                                            <button class="text-button" onClick={handleStartLocalServer}>
                                                Start local server
                                            </button>
                                        </Show>
                                        <button class="text-button" onClick={() => setStep("remote")}>
                                            Connect to a remote server
                                        </button>
                                    </div>
                                </div>
                            </Match>
                            <Match when={step() === "local"}>
                                <div>
                                    <button class="text-button" onClick={() => setStep("start")}>
                                        Go back
                                    </button>
                                    <LocalServerSetupContent 
                                        isFirstInstall={false}
                                        onReady={() => {
                                            setLocalServerInstalled(true);
                                        }} 
                                    />
                                </div>
                            </Match>
                            <Match when={step() === "remote"}>
                                <div>
                                    <button class="text-button go-back" onClick={() => setStep("start")}>
                                        Go back
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
                            Finish Setup
                        </button>
                    </div>
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