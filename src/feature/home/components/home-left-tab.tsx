import { createSignal, For, onMount, Show } from "solid-js"
import { HomeRouteConfig } from "../home-route";
import { useAppSession } from "~/network/app-session-provider";
import "~/style/screens/home/home.css";
import { Dropdown } from "~/components/panels/dropdown";

export const HomeLeftTab = (props: {
    routes: HomeRouteConfig[]
}) => {
    const appSession = useAppSession();
    const [userId, setUserId] = createSignal<string>("");

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    
    return (
        <Show when={isMounted()}>
            <div class="home-left-tab">
                <div class="row-container align-center">
                    <div class="user-profile-holder">
                        <Dropdown 
                            icon={<div class="user-profile">
                                {(appSession.userSession?.user_id ?? "?")[0]}
                            </div>}
                            content={
                                <Show when={appSession.userSession} fallback={
                                    <div class="container">
                                        {/* TODO: arrumar isso aqui porque tecnicamente depende */}
                                        {/* de importar o css do editor */}
                                        <div class="field-grid">
                                            <label class="field-value-label" for="">Username</label>
                                            <input class="field-input" type="text" oninput={(e) => {
                                                setUserId(e.target.value);
                                            }}/>
                                        </div>
                                        <button onclick={() => appSession.login(userId())}>
                                            Login
                                        </button>
                                    </div>
                                }>
                                    <div class="container">
                                        <button onclick={() => appSession.logout()}>
                                            Logout
                                        </button>
                                    </div>
                                </Show>
                            }
                        />
                        <span class="username">{appSession.userSession?.display_name ?? "Unknown"}</span>
                    </div>
                    
                </div>
                <For each={props.routes}>
                    {(route) => <a href={route.route} class="home-left-tab-route keep row-container align-center">
                        {route.iconElement()}
                        <span class="home-route-label">
                            {route.label}
                        </span>
                    </a>}
                </For>
            </div>
        </Show>
    )
}