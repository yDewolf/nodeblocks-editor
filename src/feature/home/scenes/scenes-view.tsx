import { createSignal, onMount, Show, For, ParentComponent, createEffect } from "solid-js";
import { SceneHTTPController } from "~/network/api/scene-http-controller";
import { useAppSession } from "~/network/app-session-provider";
import { UserSessionData } from "~/network/protocols/user-session";
import { Dropdown } from '../../../components/panels/dropdown';
import ArrowRightIcon from '~/assets/icons/arrow-right.svg';
import { PackageManagerHTTPController } from "~/network/api/package-http-controller";
import { usePackageManager } from "~/feature/editor/contexts/package-manager-context";
import { SceneCard } from "./components/scene-card";

import RefreshIcon from '~/assets/icons/refresh.svg';
import "~/style/screens/home/scenes.css";
import { SceneEditModal } from "./components/scene-edit-modal";
import { ScenePermissionsMenu } from './components/scene-perms-menu';

export const ScenesRoute: ParentComponent = (props) => {
    const appSession = useAppSession();
    const packageManager = usePackageManager();

    const sceneController = new SceneHTTPController(appSession);
    const packageController = new PackageManagerHTTPController(appSession);

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
        packageController.fetchAndLoadManifests(packageManager);
    });

    return (
        <Show when={isMounted()}>
            <ScenesView sessionData={appSession.userSession} sceneController={sceneController}/>
        </Show>
    )
}


export const ScenesView = (props: {
    sessionData?: UserSessionData,
    sceneController: SceneHTTPController
}) => {
    const [sceneName, setSceneName] = createSignal<string>("");
    const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
    const [activeSceneId, setActiveSceneId] = createSignal<string | null>(null);

    createEffect(() => {
        props.sceneController.fetchScenes(props.sessionData?.user_id);
    });
        
    const fetchSceneData = async (sceneId: string) => {
        return props.sceneController.fetchSceneData(sceneId, props.sessionData?.user_id);
    }

    const editScene = (sceneId: string) => {
        setActiveSceneId(sceneId);
        setIsEditModalOpen(true);
    }

    const closeModal = () => {
        setIsEditModalOpen(false);
        setActiveSceneId(null);
    }

    return (
        <div class="container">
            <div class="keep row-container fill space-between">
                <span><strong>Scenes</strong></span>
                <div class="scenes-page-actions">
                    <Dropdown icon={
                        <span>New Scene</span>
                    } iconClass="text-button">
                        <Show when={props.sessionData} fallback={
                            <span>You must authenticate before creating scenes</span>
                        }>
                            {(sessionData) => {
                                const [defaultPerm, setDefaultPerm] = createSignal<number>(0);
                                return <>
                                    <div class="create-scene-action container">
                                        <div class="field-grid">
                                            <label class="field-label" for="scene-name">Scene Id:</label>
                                            <input class="field-input" type="text" id="scene-name" oninput={(e) => setSceneName(e.target.value)} autocomplete="off"/>
                                        </div>
                                    </div>
                                    <div class="text-section">
                                        <span>Default Permissions</span>
                                        <ScenePermissionsMenu 
                                            sessionData={sessionData()}
                                            initialPerms={0}
                                            sceneController={props.sceneController}

                                            perms={defaultPerm}
                                            setPerms={setDefaultPerm}
                                        />
                                    </div>
                                    <div class="row-container" style={{"justify-content": "right"}}>
                                        <button 
                                            class="icon-button" 
                                            onclick={() => {
                                                props.sceneController.createScene(sessionData().user_id, sceneName(), defaultPerm())
                                            }}
                                            >
                                            Create <ArrowRightIcon class="smaller-icon"/>
                                        </button>
                                    </div>
                                </>
                            }}
                        </Show>
                    </Dropdown>
                </div>
            </div>
            <div class="keep row-container fill">
                <button class="icon-button" onclick={() => props.sceneController.fetchScenes(
                    props.sessionData?.user_id,
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
                        {(scene) => <SceneCard listedScene={scene} fetchSceneData={fetchSceneData} editScene={editScene}/>}
                    </For>
                </div>
            </Show>
            
            <Show when={props.sessionData}>
                {(sessionData) => 
                    <Show when={activeSceneId()}>
                        {(sceneId) => {
                            const listedScene = props.sceneController.sceneIndex[sceneId()];
                            return (
                                <SceneEditModal 
                                    sceneController={props.sceneController}
                                    sessionData={sessionData()}
                                    listedScene={listedScene}
                                    closeModal={closeModal} 
                                    isModalOpened={isEditModalOpen}
                                />
                            )
                        }}
                    </Show>
                }
            </Show>
        </div>
    )
}
