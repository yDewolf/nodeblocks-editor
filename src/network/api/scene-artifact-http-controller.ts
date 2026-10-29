import { AppSessionManager } from "../app-session-manager";

export class SceneArtifactHTTPController {
    constructor(
        private readonly appSession: AppSessionManager,
        private readonly sceneId: string
    ) {
        
    }

    public async fetchArtifactBlob(node_id: string, artifact_name: string): Promise<Blob> {
        const cleanPath = artifact_name.replace(/^artifacts\//, "");
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/scene/${this.sceneId}/artifacts/${node_id}/${cleanPath}`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                body: JSON.stringify({
                    user_id: this.appSession.userSession?.user_id,
                    password: undefined
                })
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load artifact: ${response.statusText} (${response.status})`);
        }

        return await response.blob();
    }

    public async fetchArtifactObjectUrl(node_id: string, artifact_name: string): Promise<string> {
        const blob = await this.fetchArtifactBlob(node_id, artifact_name);
        return URL.createObjectURL(blob);
    }
}