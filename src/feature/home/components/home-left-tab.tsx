import { createSignal, For, onMount, Show } from "solid-js"
import { useAppSession } from "~/network/app-session-provider";
import "~/style/screens/home/home.css";
import { Dropdown } from "~/components/panels/dropdown";
import { useLocation } from "@solidjs/router";
import SettingsIcon from "~/assets/icons/settings.svg";
import { useI18n } from "~/i18n/i18n-context";
import { LoginForm } from "./login-form";
import { RouteDisplayConfig, RouteRef } from "~/feature/routing/route-display";

export const HomeLeftTab = (props: {
    routes: RouteDisplayConfig[]
}) => {
    const { t } = useI18n();
    const appSession = useAppSession();
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
                            <LoginForm />
                        </Dropdown>
                        <span class="username">{appSession.userSession?.display_name ?? t("words.unknown")}</span>
                    </div>
                    
                </div>
                <div class="home-left-tab-routes keep container fill">
                    <For each={props.routes}>
                        {(route) => <RouteRef route={route} />}
                    </For>
                </div>
                <RouteRef route={{
                    route: "/settings",
                    iconElement: () => <SettingsIcon class="smaller-icon"/>,
                    label: t("words.settings")
                }} />
                {/* TODO: add settings button here */}
            </div>
        </Show>
    )
}