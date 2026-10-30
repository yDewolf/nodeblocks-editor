import { createSignal, Setter } from "solid-js";
import { AppSessionManager } from "~/network/app-session-manager";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

export interface ListedScene {
    uid: string;
    dependencies: Record<string, string>;
}

export class SceneHTTPController {
    private _scenes: () => ListedScene[];
    private _setScenes: Setter<ListedScene[]>;
    
    private _isLoading: () => boolean;
    private _setIsLoading: Setter<boolean>;

    public get scenes() { return this._scenes(); }
    public get isLoading() { return this._isLoading(); }

    constructor(
        private readonly appSession: AppSessionManager
    ) {
        [this._scenes, this._setScenes] = createSignal<ListedScene[]>([]);
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
            this._setScenes([...data]);
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

    public async createScene(userId: string, sceneId: string) {
        try {
            const response = await fetch(this.appSession.baseHttpUrl + `/api/scene/create/${sceneId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
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
}