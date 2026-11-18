import type { Component } from "solid-js";
import { createWizardContext } from "./utils/wizard-context";

export interface SetupData {
    localInstall: boolean,
    isLocalServerInstalled: boolean,
    isConnectedToAServer: boolean,
    isServerReady: boolean,
    isAuthenticated: boolean,
}

export const initialSetupData: SetupData = {
    localInstall: true,
    isLocalServerInstalled: false,
    isConnectedToAServer: false,
    isServerReady: false,
    isAuthenticated: false,
};

export const { WizardProvider: SetupProvider, useWizard: useSetup } = createWizardContext<SetupData, Component>();
