import { createSignal, onMount, Show, For, ParentComponent } from "solid-js";
import { SceneHTTPController } from "~/network/api/scene-http-controller";
import { useAppSession } from "~/network/app-session-provider";
import { UserSessionData } from "~/network/protocols/user-session";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { SceneCard } from "./components/scene-card";

import "~/style/screens/home/scenes.css";

export const ScenesRoute: ParentComponent = (props) => {
    const appSession = useAppSession();
    const sceneController = new SceneHTTPController(appSession);

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    return (
        <Show when={isMounted()}>
            <Show when={appSession.userSession} fallback={
                <span>User must be authenticated</span>
            }>
                {(sessionData) => 
                    <ScenesView sessionData={sessionData()} sceneController={sceneController}/>
                }
            </Show>
        </Show>
    )
}


export const ScenesView = (props: {
    sessionData: UserSessionData,
    sceneController: SceneHTTPController
}) => {
    const [targetScene, setTargetScene] = createSignal<string>("");

    onMount(() => {
        props.sceneController.fetchScenes(props.sessionData.user_id);
    })

    return (
        <div class="container">
            <div class="keep row-container fill">
                <input type="text" oninput={(e) => setTargetScene(e.target.value)}/>
                <button onclick={() => props.sceneController.createScene(props.sessionData.user_id, targetScene())}>
                    Create Scene
                </button>
            </div>
            <div class="keep row-container fill">
                <button class="icon-button" onclick={() => props.sceneController.fetchScenes(
                    props.sessionData.user_id,
                    // TODO: password
                )}>
                    <RefreshIcon />
                </button>
                <span>Found {props.sceneController.scenes.length} scenes</span>
            </div>
            <Show when={!props.sceneController.isLoading} fallback={
                <span>Loading Scenes...</span>
            }>
                <div class="scene-card-grid">
                    <For each={props.sceneController.scenes}>
                        {(scene) => <SceneCard listedScene={scene}/>}
                    </For>
                </div>
            </Show>
        </div>
    )
}
