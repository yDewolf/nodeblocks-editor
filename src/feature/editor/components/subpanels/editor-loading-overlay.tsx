import { Show } from "solid-js";
import { useSceneRuntime } from "~/feature/scene/scene-runtime-context"
import RefreshIcon from '~/assets/icons/refresh.svg';

export const EditorLoadingOverlay = () => {
    const runtime = useSceneRuntime();
    return (
        <Show when={runtime?.stateController.isLoadingScene}>
            <div class="loading-overlay">
                <div class="loading-overlay-background"></div>
                <h3>Loading Scene...</h3>
                <RefreshIcon class="auto-loop"/>
            </div>
        </Show>
    )
}