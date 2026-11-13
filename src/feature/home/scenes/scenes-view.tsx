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
import { useI18n } from "~/i18n/i18n-context";

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
    const appSession = useAppSession();
    const { t } = useI18n();
    const [sceneName, setSceneName] = createSignal<string>("");
    const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
    const [activeSceneId, setActiveSceneId] = createSignal<string | null>(null);
    
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

    onMount(() => {
        if (props.sessionData) {
            props.sceneController.fetchScenes(props.sessionData?.user_id);
        }
    });

    return (
        <div class="container">
            <div class="keep row-container fill space-between">
                <span><strong>{t("pages.scenes.title")}</strong></span>
                <div class="scenes-page-actions">
                    <Dropdown icon={
                        <span>{t("pages.scenes.newScene")}</span>
                    } iconClass="text-button">
                        <Show when={props.sessionData} fallback={
                            <span>{t("messages.mustBeAuthenticated", t("pages.scenes.actions.createScene"))}</span>
                        }>
                            {(sessionData) => {
                                const [defaultPerm, setDefaultPerm] = createSignal<number>(0);
                                return <>
                                    <div class="create-scene-action container">
                                        <div class="field-grid">
                                            <label class="field-label" for="scene-name">{t("pages.scenes.labels.sceneId")}</label>
                                            <input class="field-input" type="text" id="scene-name" oninput={(e) => setSceneName(e.target.value)} autocomplete="off"/>
                                        </div>
                                    </div>
                                    <div class="text-section">
                                        <span>{t("pages.scenes.defaultPermissions")}</span>
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
                                            {t("words.create")} <ArrowRightIcon class="smaller-icon"/>
                                        </button>
                                    </div>
                                </>
                            }}
                        </Show>
                    </Dropdown>
                </div>
            </div>
            <div class="keep row-container fill">
                <button class="icon-button" onclick={() => {
                    if (!props.sessionData) return;

                    props.sceneController.fetchScenes(
                        props.sessionData?.user_id,
                        // TODO: password
                    )
                }}>
                    <RefreshIcon class="smaller-icon"/>
                </button>
                <span class="center-content">{t("pages.scenes.foundScenes", props.sceneController.scenes.length)}</span>
            </div>
            <Show when={appSession.isConnectedToServer} fallback={
                <span>{t("messages.noConnectionWithServer")}</span>
            }>
                <Show when={props.sessionData} fallback={
                    <span>{t("messages.mustBeAuthenticated", t("pages.scenes.actions.viewScenes"))}</span>
                }>
                    {(sessionData) => <>
                        <Show when={!props.sceneController.isLoading} fallback={
                            <span>{t("messages.loading", t("words.scenes"))}</span>
                        }>
                            <div class="scene-card-grid">
                                <For each={props.sceneController.scenes}>
                                    {(scene) => <SceneCard listedScene={scene} fetchSceneData={fetchSceneData} editScene={editScene}/>}
                                </For>
                            </div>
                        </Show>
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
                    </>}
                </Show>
            </Show>
        </div>
    )
}
