import { Component } from "solid-js";
import { SetupData } from "./setup-wizard-context";
import { WizardStepDef } from "./utils/wizard-step";
import WelcomeStep from "./steps/welcome-step";

export type SetupStep = WizardStepDef<SetupData, Component>;
export const setupSteps: SetupStep[] = [
    {
        id: "welcome",
        title: "Welcome",
        view: WelcomeStep,
    },
];
