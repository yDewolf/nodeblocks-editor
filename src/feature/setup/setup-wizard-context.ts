import type { Component } from "solid-js";
import { createWizardContext } from "./utils/wizard-context";

export type RuntimeStatus = "idle" | "installing" | "ready" | "error";
export interface SetupData {
    localInstall: boolean,
    isLocalServerInstalled: boolean,
    isConnectedToAServer: boolean,
    isAuthenticated: boolean,
    runtime: { status: RuntimeStatus; percent: number; message: string };
}

export const initialSetupData: SetupData = {
    localInstall: true,
    isLocalServerInstalled: false,
    isConnectedToAServer: false,
    isAuthenticated: false,
    runtime: { status: "idle", percent: 0, message: "" },
};

export const { WizardProvider: SetupProvider, useWizard: useSetup } = createWizardContext<SetupData, Component>();
