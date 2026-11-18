import { createEffect, type Component } from "solid-js";
import { initialSetupData, SetupData, SetupProvider } from "./setup-wizard-context";
import { WizardController } from "./utils/wizard-controller";
import { setupSteps } from "./setup-steps";
import { WizardShell } from "./components/wizard-shell";
import { useAppSession } from "~/network/app-session-provider";
import { appSettings } from "../app-settings";
import { localServerController } from "~/network/api/local-server-controller";

export default function SetupWizard(props: { onFinished?: () => void, onCancel?: () => void }) {
    const appSession = useAppSession();
    const cancelable = !appSettings.isFirstTimeSetup;
    const wizard = new WizardController<SetupData, Component>(
        setupSteps, 
        initialSetupData,
        cancelable,
        async () => {
            props.onFinished?.();
            wizard.setCancelable(!appSettings.isFirstTimeSetup);
        },
        () => {
            props.onCancel?.();
        }
    );

    createEffect(() => {
        wizard.setData("isLocalServerInstalled", localServerController.isInstalled);
        wizard.setData("isConnectedToAServer", appSession.isConnectedToServer);
        wizard.setData("isAuthenticated", appSession.isAuthenticated());
    });

    return (
        <SetupProvider value={wizard}>
            <WizardShell wizard={wizard} />
        </SetupProvider>
    );
}