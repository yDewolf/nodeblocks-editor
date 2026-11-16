import type { Component } from "solid-js";
import { createWizardContext } from "./utils/wizard-context";

export type RuntimeStatus = "idle" | "installing" | "ready" | "error";
export interface SetupData {
  runtime: { status: RuntimeStatus; percent: number; message: string };
}

export const initialSetupData: SetupData = {
  runtime: { status: "idle", percent: 0, message: "" },
};

export const { WizardProvider: SetupProvider, useWizard: useSetup } = createWizardContext<SetupData, Component>();
