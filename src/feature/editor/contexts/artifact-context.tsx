import { createContext, useContext, ParentComponent, onCleanup } from "solid-js";
import { SceneArtifactHTTPController } from "~/network/api/scene-artifact-http-controller";

interface ISceneArtifactContext {
    fetchArtifact: (node_id: string, artifact_name: string) => Promise<string>;
}

const SceneArtifactContext = createContext<ISceneArtifactContext>();
export const SceneArtifactProvider: ParentComponent<{
    artifactController: SceneArtifactHTTPController
}> = (props) => {
    const urlCache = new Map<string, string>();

    const fetchArtifact = async (node_id: string, artifact_name: string): Promise<string> => {
        if (urlCache.has(artifact_name)) {
            return urlCache.get(artifact_name)!;
        }

        const objectUrl = await props.artifactController.fetchArtifactObjectUrl(
            node_id,
            artifact_name
        );
        
        urlCache.set(artifact_name, objectUrl);
        return objectUrl;
    };

    onCleanup(() => {
        for (const url of urlCache.values()) {
            URL.revokeObjectURL(url);
        }
        urlCache.clear();
    });

    return (
        <SceneArtifactContext.Provider value={{ fetchArtifact }}>
            {props.children}
        </SceneArtifactContext.Provider>
    );
};

export const useSceneArtifacts = () => {
    const context = useContext(SceneArtifactContext);
    if (!context) {
        throw new Error("useSceneArtifacts must be used inside a SceneArtifactProvider!");
    }
    return context;
};