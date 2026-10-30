import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ListedScenePerms, SceneHTTPController } from "~/network/api/scene-http-controller";
import { ScenePermission, togglePermission, hasPermission } from "~/network/protocols/scene-perms";
import { UserSessionData } from "~/network/protocols/user-session";

export const ScenePermissionsMenu: Component<{
    sceneId: string
    sessionData: UserSessionData
    targetUser?: string
    initialPerms: number
    sceneController: SceneHTTPController

    permissionStore?: ListedScenePerms
    setPermissionStore?: SetStoreFunction<ListedScenePerms | undefined>
}> = (props) => {
    const [perms, setPerms] = createSignal<number>(props.initialPerms);
    const [isSaving, setIsSaving] = createSignal(false);
    
    const permissionList = [
        { label: "Read", value: ScenePermission.READ },
        { label: "Execute", value: ScenePermission.EXECUTE },
        { label: "Edit", value: ScenePermission.EDIT },
        { label: "Admin", value: ScenePermission.ADMIN },
    ];

    const handleToggle = (flag: ScenePermission) => {
        setPerms((prev) => togglePermission(prev, flag));
    };

    const applyPreset = (presetValue: number) => {
        setPerms(presetValue);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await props.sceneController.updateScenePerms(props.sceneId, perms(), props.targetUser, props.sessionData.user_id);
        
        } catch (error) {
            console.error("Failed to save permissions", error);
        
        } finally {
            setIsSaving(false);
        }
    };

    createEffect(() => {
        const perm = perms();
        if (props.targetUser) {
            props.setPermissionStore?.("user_permissions", props.targetUser, perm);
        } else {
            props.setPermissionStore?.("default_perm", perm);
        }
    });

    return (
        <div class="container fill">
            <div class="text-section">
                <div class="container fill">
                    <For each={permissionList}>
                        {(item) => {
                            const checked = () => hasPermission(perms(), item.value);
                            return (
                                <label class="keep row-container">
                                    <input 
                                        type="checkbox"
                                        checked={checked()}
                                        onChange={() => handleToggle(item.value)}
                                    />
                                    {item.label}
                                </label>
                            );
                        }}
                    </For>
                </div>
            </div>
            <hr />
            <div class="text-section">
                <span>Default Profiles</span>
                <div class="keep fill row-container space-between">
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.VIEWER)}
                    >
                        Viewer
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.OPERATOR)}
                    >
                        Operator
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.EDITOR)}
                    >
                        Editor
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.ALL)}
                    >
                        All (Admin)
                    </button>
                </div>
            </div>
            
            <Show when={!props.setPermissionStore || !props.permissionStore}>
                <button
                    type="button"
                    disabled={isSaving()}
                    class="text-button"
                    onClick={handleSave}
                >
                    {isSaving() ? "Saving..." : "Save Permissions"}
                </button>
            </Show>
        </div>
    );
};