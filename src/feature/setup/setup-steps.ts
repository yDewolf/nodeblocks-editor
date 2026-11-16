import { Component } from "solid-js";
import { SetupData } from "./setup-wizard-context";
import { WizardStepDef } from "./utils/wizard-step";
import WelcomeStep from "./steps/welcome-step";
import { LocalOrRemoteStep } from "./steps/local-or-remote-step";
import { LocalServerInstall } from "./steps/local-server-install";
import { RemoteServerConnection } from "./steps/remote-server-connection";
import { LocalServerSetup } from "./steps/local-server-setup";
import { CreateUserStep } from "./steps/create-user-step";
import { ConfigureEditorStep } from './steps/configure-editor-step';
import { AllSetUp } from "./steps/all-set-up-step";
import { PluginSetupStep } from "./steps/local-plugins-setup";

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
        id: "localServerInstall",
        title: "Local Server Installation",
        view: LocalServerInstall,
        when: (data) => data.localInstall
    },
    {
        id: "localServerSetup",
        title: "Local Server Setup",
        view: LocalServerSetup,
        when: (data) => data.localInstall && data.isLocalServerInstalled,
        validate: (data) => data.isConnectedToAServer ? null : "Must connect to a server before continuing"
    },
    {
        id: "serverPluginsSetup",
        title: "Plugins Setup",
        view: PluginSetupStep,
        when: (data) => data.localInstall && data.isLocalServerInstalled,
        validate: (data) => data.isConnectedToAServer ? null : "Must connect to a server before continuing"
    },
    {
        id: "remoteServerSetup",
        title: "Remote Server Connection",
        view: RemoteServerConnection,
        when: (data) => !data.localInstall,
        validate: (data) => data.isConnectedToAServer ? null : "Must connect to a server before continuing"
    },
    {
        id: "userCreate",
        title: "Create a user",
        view: CreateUserStep,
        when: (data) => data.isConnectedToAServer,
        validate: (data) => data.isAuthenticated ? null : "Must authenticate before continuing"
    },
    {
        id: "editorSettings",
        title: "Configure editor",
        view: ConfigureEditorStep
    }, 
    {
        id: "allSetUp",
        title: "All Set Up",
        view: AllSetUp,
    }
];
