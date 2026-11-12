import { Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context"
import { localServerController } from "~/network/api/local-server-controller";

export const LocalServerLogs = () => {
    const {t} = useI18n();
    return (
        <Show when={localServerController.isRunning}>
            <details>
                <summary>{t("pages.settings.setupWizard.serverOutput")}</summary>
                <pre>{localServerController.logs.join("\n")}</pre>
            </details>
        </Show>
    )
}