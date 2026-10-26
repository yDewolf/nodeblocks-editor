import { For } from "solid-js"
import { HomeRouteConfig } from "../home-route";

export const HomeLeftTab = (props: {
    routes: HomeRouteConfig[]
}) => {
    return (
        <div class="home-left-tab container">
            <For each={props.routes}>
                {(route) => <a href={route.route} class="home-left-tab-route keep row-container align-center">
                    {route.iconElement()}
                    <span class="home-route-label">
                        {route.label}
                    </span>
                </a>}
            </For>
        </div>
    )
}