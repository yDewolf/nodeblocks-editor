import { useI18n } from "~/i18n/i18n-context";
import { useSetup } from "../setup-wizard-context";
import { LocalServerPanel } from "~/feature/local-server/local-server-components";
import { createEffect, Show } from "solid-js";
import { useAppSession } from "~/network/app-session-provider";
import { ServerStatuses } from "~/protocols/nodeblocks/network/server-events";

export const PluginSetupStep = () => {
    const appSession = useAppSession();
    const wizard = useSetup();
    const {t} = useI18n();

    createEffect(() => {
        wizard.setData("isServerReady", appSession.serverStatus == ServerStatuses.READY);
    })

    return (
        <>
            <p>{t("pages.setupWizard.pluginsSetup.pluginBasedNotice")}</p>
            <p class="note"><b>{t("words.note")}:</b> {t("pages.setupWizard.pluginsSetup.responsibilityNotice")}</p>
            <br />
            
            <p><b>{t("pages.setupWizard.pluginsSetup.howToInstallPlugins")}</b></p>
            <ol>
                <li>{t("pages.setupWizard.pluginsSetup.pluginInstallStep1")};</li>
                <li>{t("pages.setupWizard.pluginsSetup.pluginInstallStep2")};</li>
                <li>{t("pages.setupWizard.pluginsSetup.pluginInstallStep3")};</li>
                <li>{t("pages.setupWizard.pluginsSetup.pluginInstallStep4")}.</li>
            </ol>
            <details>
                <summary>{t("words.originalPlugins")}</summary>
                <ul>
                    {/* TODO: arranjar um jeito de fazer fetch de todos os plugins originais */}
                    <li><a href="https://github.com/yDewolf/ytorchplugin" target="_blank">ytorchplugin: PyTorch Machine Learning</a></li>
                </ul>
            </details>
            <br />
            <h3>{t("pages.setupWizard.pluginsSetup.installTrustedPluginsOnly")}</h3>
            <Show when={wizard.data.isServerReady}>
                <span>{t("pages.setupWizard.pluginsSetup.pluginsSetupComplete")} <b>{t("pages.setupWizard.messages.youCanProceed")}</b></span>
            </Show>
            <br />
            <LocalServerPanel/>
        </>
    );
}