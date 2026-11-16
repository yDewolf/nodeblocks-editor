import type { Component } from "solid-js";
import { initialSetupData, SetupData, SetupProvider } from "./setup-wizard-context";
import { WizardController } from "./utils/wizard-controller";
import { setupSteps } from "./setup-steps";
import { WizardShell } from "./components/wizard-shell";

export default function SetupWizard(props: { onFinished?: () => void }) {
    const wizard = new WizardController<SetupData, Component>(
        setupSteps, 
        initialSetupData, 
        async () => {
            props.onFinished?.();
        }
    );

    return (
        <SetupProvider value={wizard}>
            <WizardShell wizard={wizard} />
        </SetupProvider>
    );
}