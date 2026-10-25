import { createSignal, Setter } from "solid-js";
import { AppSessionManager } from "~/network/app-session-manager";

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

    public async fetchScenes(userId: string, password?: string): Promise<ListedScene[]> {
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
                throw new Error(errorData.detail || "Erro ao carregar as cenas.");
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
}