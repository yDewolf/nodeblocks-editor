import { createSignal, For, onMount, Show } from "solid-js"
import { HomeRouteConfig } from "../home-route";
import { useAppSession } from "~/network/app-session-provider";
import "~/style/screens/home/home.css";
import { Dropdown } from "~/components/panels/dropdown";
import { useLocation } from "@solidjs/router";
import SettingsIcon from "~/assets/icons/settings.svg";
import { useI18n } from "~/i18n/i18n-context";

export const HomeLeftTab = (props: {
    routes: HomeRouteConfig[]
}) => {
    const { t } = useI18n();
    const appSession = useAppSession();
    const [userId, setUserId] = createSignal<string>("");

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    const location = useLocation();
    return (
        <Show when={isMounted()}>
            <div class="home-left-tab">
                <div class="row-container align-center">
                    <div class="user-profile-holder">
                        <Dropdown 
                            icon={<div class="user-profile">
                                {(appSession.userSession?.user_id ?? "?")[0]}
                            </div>}
                        >
                            <Show when={appSession.isAuthenticated()} fallback={
                                <div class="container">
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
                                <div class="container">
                                    <button class="text-button" onclick={() => appSession.logout()}>
                                        {t("components.login.logout")}
                                    </button>
                                </div>
                            </Show>
                        </Dropdown>
                        <span class="username">{appSession.userSession?.display_name ?? t("words.unknown")}</span>
                    </div>
                    
                </div>
                <div class="home-left-tab-routes keep container fill">
                    <For each={props.routes}>
                        {(route) => {
                            const isActive = () => location.pathname === route.route;
                            return (
                                <a 
                                    href={route.route} 
                                    class="home-left-tab-route keep row-container align-center"
                                    classList={{selected: isActive()}}                    
                                >
                                    {route.iconElement()}
                                    <span class="home-route-label">
                                        {route.label}
                                    </span>
                                </a>
                            )
                        }}
                    </For>
                </div>
                <a 
                    href="/settings"
                    class="home-left-tab-route keep row-container align-center"
                    classList={{selected: location.pathname == "/settings"}}
                >
                    <SettingsIcon class="smaller-icon"/>
                    <span class="home-route-label">
                        {t("words.settings")}
                    </span>
                </a>
                {/* TODO: add settings button here */}
            </div>
        </Show>
    )
}