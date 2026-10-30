import { createSignal, For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { ModalOverlay } from "~/components/modal-overlays"
import { DropdownSection } from "~/components/panels/dropdown";
import { ListedScene, ListedScenePerms, SceneHTTPController } from "~/network/api/scene-http-controller"
import { UserSessionData } from "~/network/protocols/user-session";
import { ScenePermissionsMenu } from "./scene-perms-menu";
import CloseIcon from '~/assets/icons/close.svg';

export const SceneEditModal = (props: {
    listedScene: ListedScene
    sessionData: UserSessionData
    sceneController: SceneHTTPController
    closeModal: () => void
    isModalOpened: () => boolean
}) => {
    const [allScenePerms, setAllScenePerms] = createStore<ListedScenePerms | undefined>(undefined);
    const [currentUserId, setCurrentUserId] = createSignal<string>("");
    const [isSaving, setIsSaving] = createSignal(false);

    // const defaultScenePerms = () => props.sceneController.fetchScenePerms(props.listedScene.uid);
    // const allScenePerms = () => props.sceneController.fetchAllScenePerms(props.listedScene.uid, props.sessionData.user_id);

    const addUserPerm = (userId: string) => {
        setAllScenePerms("user_permissions", userId, allScenePerms?.default_perm ?? 0);
        setCurrentUserId("");
    }
    
    const handleDeleteUserPerms = (userId: string) => {
        setAllScenePerms("user_permissions", userId, undefined as any);
    }

    onMount(async () => {
        setAllScenePerms(await props.sceneController.fetchAllScenePerms(props.listedScene.uid, props.sessionData.user_id));
    })

    const handleSavePermissions = async () => {
        setIsSaving(true);
        if (!allScenePerms) return;

        await props.sceneController.updateScenePerms(props.listedScene.uid, allScenePerms?.default_perm, undefined, props.sessionData.user_id);
        for (const [userId, perms] of Object.entries(allScenePerms.user_permissions)) {
            await props.sceneController.updateScenePerms(props.listedScene.uid, perms, userId, props.sessionData.user_id);
        }
        setIsSaving(false);
    }


    return (
        <ModalOverlay 
            title={"Scene Edit"} 
            closeModal={props.closeModal} 
            isModalOpened={props.isModalOpened}
            buttons={[
                <button 
                    class="text-button" 
                    onclick={handleSavePermissions}
                    disabled={isSaving()}
                >
                    {isSaving() ? "Saving..." : "Save Permissions"}
                </button>
            ]}
        >
            <div class="text-section">
                <span>Default Permission</span>
                <ScenePermissionsMenu 
                    sceneId={props.listedScene.uid}
                    sessionData={props.sessionData}
                    initialPerms={allScenePerms?.default_perm ?? 0}
                    sceneController={props.sceneController}

                    setPermissionStore={setAllScenePerms}
                    permissionStore={allScenePerms}
                />
            </div>
            <div class="text-section">
                <span>User Permission</span>
                <div class="row-container fill">
                    <input type="text" class="fill" placeholder="user id" value={currentUserId()} oninput={(e) => setCurrentUserId(e.target.value)}/>
                    <button class="text-button" onclick={() => {
                        if (currentUserId() == "") { return; }
                        addUserPerm(currentUserId());
                    }}>+</button>
                </div>
            </div>
            <For each={Object.keys(allScenePerms?.user_permissions ?? {})}>
                {(userId) => <DropdownSection
                    header_content={() => 
                        <div class="keep row-container space-between">
                            <button class="icon-button" onclick={() => handleDeleteUserPerms(userId)}>
                                <CloseIcon class="smaller-icon"/>
                            </button>
                            <span class="center-content">{userId}</span>
                        </div>
                    }
                    content={<ScenePermissionsMenu
                        sceneId={props.listedScene.uid}
                        sessionData={props.sessionData}
                        targetUser={userId}
                        initialPerms={allScenePerms?.user_permissions[userId] ?? 0}
                        sceneController={props.sceneController}

                        setPermissionStore={setAllScenePerms}
                        permissionStore={allScenePerms}
                    />}
                />}
            </For>
        </ModalOverlay>
    )
}