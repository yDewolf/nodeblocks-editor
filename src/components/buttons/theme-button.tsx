import SunIcon from "~/assets/icons/sun.svg";
import MoonIcon from "~/assets/icons/moon.svg";
import { toggleTheme } from "~/feature/app-settings";
import { getCurrentTheme } from "~/feature/app-settings";
import { Show, createMemo } from 'solid-js';

export const ThemeButton = (props: {icon_class: string}) => {
    const currentTheme = createMemo(() => getCurrentTheme());
    return (
        <button class="icon-button" onclick={() => {
            toggleTheme();
        }}>
            <Show when={currentTheme() === "light"} fallback={
                <SunIcon class={props.icon_class}/>
            }>
                <MoonIcon class={props.icon_class}/>
            </Show>
        </button>
    )
}