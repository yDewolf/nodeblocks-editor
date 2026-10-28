import { createSignal, onMount, Show, For, ParentComponent } from "solid-js";
import { SceneHTTPController } from "~/network/api/scene-http-controller";
import { useAppSession } from "~/network/app-session-provider";
import { UserSessionData } from "~/network/protocols/user-session";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { SceneCard } from "./components/scene-card";

import "~/style/screens/home/scenes.css";
import { Dropdown } from '../../../components/panels/dropdown';
import ArrowRightIcon from '~/assets/icons/arrow-right.svg';

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
    const [sceneName, setSceneName] = createSignal<string>("");

    onMount(() => {
        props.sceneController.fetchScenes(props.sessionData.user_id);
    })

    return (
        <div class="container">
            <div class="keep row-container fill space-between">
                <span><strong>Scenes</strong></span>
                <div class="scenes-page-actions">
                    <Dropdown icon={
                        <span>New Scene</span>
                    } iconClass="text-button">
                        <div class="create-scene-action container">
                            <div class="field-grid">
                                <label class="field-label" for="scene-name">Scene Name:</label>
                                <input class="field-input" type="text" id="scene-name" oninput={(e) => setSceneName(e.target.value)} autocomplete="off"/>
                            </div>
                        </div>
                        <div class="row-container" style={{"justify-content": "right"}}>
                            <button 
                                class="icon-button" 
                                onclick={() => props.sceneController.createScene(props.sessionData.user_id, sceneName())}
                            >
                                Criar <ArrowRightIcon class="smaller-icon"/>
                            </button>
                        </div>
                    </Dropdown>
                </div>
            </div>
            <div class="keep row-container fill">
                
            </div>
            <div class="keep row-container fill">
                <button class="icon-button" onclick={() => props.sceneController.fetchScenes(
                    props.sessionData.user_id,
                    // TODO: password
                )}>
                    <RefreshIcon class="smaller-icon"/>
                </button>
                <span class="center-content">Found {props.sceneController.scenes.length} scenes</span>
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
