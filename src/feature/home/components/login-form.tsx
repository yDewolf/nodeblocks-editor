import { createSignal, Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";
import { useAppSession } from "~/network/app-session-provider"

export const LoginForm = () => {
    const { t } = useI18n();
    const [userId, setUserId] = createSignal<string>("");
    const appSession = useAppSession();
    return (
        <Show when={appSession.isAuthenticated()} fallback={
            <div class="container fill">
                {/* TODO: arrumar isso aqui porque tecnicamente depende */}
                {/* de importar o css do editor */}
                <div class="field-grid">
                    <label class="field-value-label" for="">{t("components.login.username")}</label>
                    <input class="field-input" type="text" oninput={(e) => {
                        setUserId(e.target.value);
                    }}/>
                </div>
                <button class="text-button" onclick={() => appSession.login(userId())}>
                    {t("components.login.login")}
                </button>
            </div>
        }>
            <div class="container fill">
                <p>{t("components.login.loggedAs", appSession.userSession?.user_id ?? t("words.unknown"))}</p>
                <button class="text-button" onclick={() => appSession.logout()}>
                    {t("components.login.logout")}
                </button>
            </div>
        </Show>
    )
}