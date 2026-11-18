import { Component, createEffect, createSignal, For, Setter, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { useI18n } from "~/i18n/i18n-context";
import { ListedScenePerms, SceneHTTPController } from "~/network/api/scene-http-controller";
import { ScenePermission, togglePermission, hasPermission } from "~/network/protocols/scene-perms";
import { UserSessionData } from "~/network/protocols/user-session";

export const ScenePermissionsMenu: Component<{
    sceneId?: string
    sessionData: UserSessionData
    targetUser?: string
    initialPerms: number
    sceneController: SceneHTTPController

    perms?: () => number;
    setPerms?: Setter<number>;
    permissionStore?: ListedScenePerms
    setPermissionStore?: SetStoreFunction<ListedScenePerms | undefined>
    showSaveButtons?: boolean
}> = (props) => {
    const { t } = useI18n();
    if (!props.perms || !props.setPerms) {
        const [perms, setPerms] = createSignal<number>(props.initialPerms);
        props.perms = perms;
        props.setPerms = setPerms;
    }

    const [isSaving, setIsSaving] = createSignal(false);
    
    const permissionList = [
        { label: t("pages.scenes.perms.read"), value: ScenePermission.READ },
        { label: t("pages.scenes.perms.execute"), value: ScenePermission.EXECUTE },
        { label: t("pages.scenes.perms.edit"), value: ScenePermission.EDIT },
        { label: t("pages.scenes.perms.admin"), value: ScenePermission.ADMIN },
    ];

    const handleToggle = (flag: ScenePermission) => {
        props.setPerms?.((prev) => togglePermission(prev, flag));
    };

    const applyPreset = (presetValue: number) => {
        props.setPerms?.(presetValue);
    };

    const handleSave = async () => {
        if (!props.perms || !props.sceneId) return;

        setIsSaving(true);
        try {
            await props.sceneController.updateScenePerms(props.sceneId, props.perms(), props.targetUser, props.sessionData.user_id);
        
        } catch (error) {
            console.error("Failed to save permissions", error);
        
        } finally {
            setIsSaving(false);
        }
    };

    createEffect(() => {
        const perm = props.perms?.();
        if (perm == undefined) return;

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
                            const checked = () => props.perms ? hasPermission(props.perms?.(), item.value) : undefined;
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
                <span>{t("pages.scenes.defaultProfiles")}</span>
                <div class="keep fill row-container space-between">
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.VIEWER)}
                    >
                        {t("pages.scenes.profiles.viewer")}
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.OPERATOR)}
                    >
                        {t("pages.scenes.profiles.operator")}
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.EDITOR)}
                    >
                        {t("pages.scenes.profiles.editor")}
                    </button>
                    <button 
                        class="text-button"
                        type="button"
                        onClick={() => applyPreset(ScenePermission.ALL)}
                    >
                        {t("pages.scenes.profiles.all")}
                    </button>
                </div>
            </div>
            
            <Show when={props.showSaveButtons}>
                <button
                    type="button"
                    disabled={isSaving()}
                    class="text-button"
                    onClick={handleSave}
                >
                    {isSaving() ? t("words.saving") +  "..." : t("pages.scenes.savePerms")}
                </button>
            </Show>
        </div>
    );
};