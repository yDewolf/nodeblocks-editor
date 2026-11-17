import { createSignal, onMount, ParentComponent, Show } from "solid-js";
import "~/style/screens/setup/setup.css";
import { appSettings, _setSetupComplete, _setIsFirstTimeSetup } from '../app-settings';
import SetupWizard from "./setup-wizard";

export type WizardSteps = "start" | "local" | "remote";

export const SetupScreen: ParentComponent = (props) => {
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    return (
        <Show when={isMounted()}>
            <Show when={appSettings.isSetupComplete || !window.isTauriEnvironment} fallback={
                <SetupWizard 
                    onFinished={() => {
                        _setSetupComplete(true);
                        _setIsFirstTimeSetup(false);
                    }}
                    onCancel={() => {
                        _setSetupComplete(true);
                    }}
                />
            }>
                {props.children}
            </Show>
        </Show>
    )
}
