import type { Component } from "solid-js";
import { createWizardContext } from "./utils/wizard-context";

export type RuntimeStatus = "idle" | "installing" | "ready" | "error";
export interface SetupData {
    localInstall: boolean,
    isConnectedToAServer: boolean,
    runtime: { status: RuntimeStatus; percent: number; message: string };
}

export const initialSetupData: SetupData = {
    localInstall: true,
    isConnectedToAServer: false,
    runtime: { status: "idle", percent: 0, message: "" },
};

export const { WizardProvider: SetupProvider, useWizard: useSetup } = createWizardContext<SetupData, Component>();
