import { Component } from "solid-js";
import { SetupData } from "./setup-wizard-context";
import { WizardStepDef } from "./utils/wizard-step";
import WelcomeStep from "./steps/welcome-step";
import { LocalOrRemoteStep } from "./steps/local-or-remote-step";
import { LocalServerInstall } from "./steps/local-server-install";
import { RemoteServerConnection } from "./steps/remote-server-connection";

export type SetupStep = WizardStepDef<SetupData, Component>;
export const setupSteps: SetupStep[] = [
    {
        id: "welcome",
        title: "Welcome",
        view: WelcomeStep,
    },
    {
        id: "localChoice",
        title: "Server Choice",
        view: LocalOrRemoteStep
    },
    {
        id: "localServerSetup",
        title: "Local Server Installation",
        view: LocalServerInstall,
        when: (data) => data.localInstall
    },
    {
        id: "remoteServerSetup",
        title: "Remote Server Connection",
        view: RemoteServerConnection,
        when: (data) => !data.localInstall,
        validate: (data) => data.isConnectedToAServer ? null : "Must connect to a server before continuing"
    },
];
