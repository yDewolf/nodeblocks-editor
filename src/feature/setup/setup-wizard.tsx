import { createEffect, type Component } from "solid-js";
import { initialSetupData, SetupData, SetupProvider } from "./setup-wizard-context";
import { WizardController } from "./utils/wizard-controller";
import { setupSteps } from "./setup-steps";
import { WizardShell } from "./components/wizard-shell";
import { useAppSession } from "~/network/app-session-provider";

export default function SetupWizard(props: { onFinished?: () => void }) {
    const appSession = useAppSession();
    const wizard = new WizardController<SetupData, Component>(
        setupSteps, 
        initialSetupData, 
        async () => {
            props.onFinished?.();
        }
    );

    createEffect(() => {
        wizard.setData("isConnectedToAServer", appSession.isConnectedToServer);
        wizard.setData("isAuthenticated", appSession.isAuthenticated());
    });

    return (
        <SetupProvider value={wizard}>
            <WizardShell wizard={wizard} />
        </SetupProvider>
    );
}