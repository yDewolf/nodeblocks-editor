import { useLocation } from "@solidjs/router"
import { JSXElement } from "solid-js"

export interface RouteDisplayConfig {
    iconElement?: () => JSXElement
    label: string
    route: string
}

export const RouteRef = (props: {route: RouteDisplayConfig}) => {
    const location = useLocation();
    return (
        <a 
            href={props.route.route}
            class="route-reference keep row-container align-center"
            classList={{selected: location.pathname.startsWith(props.route.route)}}
        >
            {props.route.iconElement?.()}
            <span class="route-reference-label">
                {props.route.label}
            </span>
        </a>
    )
}