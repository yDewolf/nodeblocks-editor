import { createSignal, Setter } from "solid-js";
import { AppSessionManager } from "~/network/app-session-manager";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { ScenePermission } from "../protocols/scene-perms";
import { createStore, SetStoreFunction } from "solid-js/store";

export interface ListedScene {
    uid: string;
    dependencies: Record<string, string>;
    user_perms: ScenePermission
}

export interface ListedScenePerms {
    user_permissions: Record<string, ScenePermission>;
    default_perm: ScenePermission
}

export class SceneHTTPController {
    private _scenes: Record<string, ListedScene>;
    private _setScenes: SetStoreFunction<Record<string, ListedScene>>;
    
    private _isLoading: () => boolean;
    private _setIsLoading: Setter<boolean>;

    public get scenes() { return Object.values(this._scenes); }
    public get sceneIndex() { return this._scenes; }
    public get isLoading() { return this._isLoading(); }

    constructor(
        private readonly appSession: AppSessionManager
    ) {
        [this._scenes, this._setScenes] = createStore<Record<string, ListedScene>>({});
        [this._isLoading, this._setIsLoading] = createSignal<boolean>(false);
    }

    public async fetchScenes(userId?: string, password?: string): Promise<ListedScene[]> {
        this._setIsLoading(true);
        try {
            const response = await fetch(this.appSession.baseHttpUrl + "/api/scenes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail);
            }

            const data: ListedScene[] = await response.json();
            data.forEach((scene) => {
                this._setScenes(scene.uid, scene);
            })
            return data;

        } catch (error) {
            console.error("Failed to fetch scenes:", error);
            throw error;

        } finally {
            this._setIsLoading(false);
        }
    }

    public async fetchSceneData(sceneId: string, userId?: string, password?: string): Promise<SceneData> {
        try {
            const response = await fetch(this.appSession.baseHttpUrl + `/api/scene/${sceneId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail);
            }

            const data: SceneData = await response.json();
            return data;

        } catch (error) {
            console.error("Failed to fetch scene:", error);
            throw error;
        }
    }

    public async createScene(userId: string, sceneId: string, defaultPerm?: ScenePermission) {
        try {
            const response = await fetch(this.appSession.baseHttpUrl + "/api/scene/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    scene_id: sceneId,
                    default_perm: defaultPerm
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to create scene");
            }
            
            this.fetchScenes(userId);

        } catch (error) {
            console.error("Failed to create scene:", error);
            throw error;
        }
    }


    public async fetchSceneToken(scene_id: string): Promise<string> {
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/scene/${scene_id}/token`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ user_id: this.appSession.userSession?.user_id })
        });

        if (!response.ok) {
            throw new Error("Failed to generate scene connection token");
        }

        const data = await response.json();
        return data.token;
    }


    // -- perms

    public async fetchAllScenePerms(sceneId: string, userId?: string, password?: string): Promise<ListedScenePerms> {
        try {
            const url = new URL(`${this.appSession.baseHttpUrl}/api/scene/${sceneId}/perms`);
            url.search = "?target=all";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId ?? this.appSession.userSession?.user_id,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to fetch scene permissions");
            }

            const data = await response.json();
            return data as ListedScenePerms;

        } catch (error) {
            console.error("Failed to fetch scene perms:", error);
            throw error;
        }
    }

    public async fetchScenePerms(sceneId: string, userId?: string, password?: string): Promise<number> {
        try {
            const response = await fetch(`${this.appSession.baseHttpUrl}/api/scene/${sceneId}/perms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId ?? this.appSession.userSession?.user_id,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to fetch scene permissions");
            }

            const data = await response.json();
            return data.user_perms;

        } catch (error) {
            console.error("Failed to fetch scene perms:", error);
            throw error;
        }
    }

    public async updateScenePerms(
        sceneId: string, 
        userPerms: number, 
        targetUser?: string, 
        userId?: string, 
        password?: string
    ): Promise<void> {
        try {
            const url = new URL(`${this.appSession.baseHttpUrl}/api/scene/${sceneId}/perms`);
            if (targetUser) {
                url.search = `?targetUser=${encodeURIComponent(targetUser)}`
            }

            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId ?? this.appSession.userSession?.user_id,
                    password: password,
                    user_perms: userPerms
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update scene permissions");
            }

        } catch (error) {
            console.error("Failed to update scene perms:", error);
            throw error;
        }
    }
}