import { createMemo, createSignal, For, JSXElement, onMount, ParentComponent, Show } from "solid-js"
import "~/style/screens/settings.css";
import { _setSetupComplete } from "~/feature/app-settings";
import { useI18n } from "~/i18n/i18n-context";
import { RouteDisplayConfig, RouteRef } from "~/feature/routing/route-display";
import { useLocation } from "@solidjs/router";
import SettingsIcon from '~/assets/icons/settings.svg';
import LeftTabIcon from '~/assets/icons/left-tab.svg';
import ServerIcon from '~/assets/icons/server.svg';

interface SettingsRoute extends RouteDisplayConfig {
    title: string
}

export const SettingsRoute: ParentComponent = (props) => {
    const location = useLocation();
    const { t } = useI18n();
    

    const settingSections: SettingsRoute[] = [
        {
            route: "/settings/general",
            label: t("words.general"),
            title: t("pages.settings.generalTitle"),
            iconElement: () => <SettingsIcon class="smaller-icon"/>
        },
        {
            route: "/settings/editor",
            label: t("words.editor"),
            title: t("pages.settings.editorTitle"),
            iconElement: () => <LeftTabIcon class="smaller-icon"/>
        },
        {
            route: "/settings/localServer",
            label: t("words.localServer"),
            title: t("pages.settings.localServerTitle"),
            iconElement: () => <ServerIcon class="smaller-icon"/>
        }
    ];

    const currentSection = createMemo(() => {
        return settingSections.values().find((section) => section.route == location.pathname);
    });

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    return (
        <Show when={isMounted()}>
            <div class="settings-view">
                <h4>{t("pages.settings.title")}</h4>
                <div class="settings-view-body">
                    <div class="container settings-index">
                        <For each={Object.values(settingSections)}>
                            {(route) => <RouteRef route={route}/>}
                        </For>
                    </div>
                    <div class="container fill">
                        <Show when={currentSection()} fallback={
                            <>
                                {props.children}
                            </>
                        }>
                            {(section) => {
                                return <>
                                    <h3>{section().title}</h3>
                                    {props.children}
                                </>
                            }}
                        </Show>
                    </div>
                </div>
            </div>
        </Show>
    )
}

