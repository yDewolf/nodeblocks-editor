import { createResource, Show } from "solid-js";
import { useSceneArtifacts } from "~/feature/editor/contexts/artifact-context";


// TODO: style
// TODO: pensar sobre esse root_id
export const ArtifactView = (props: {
    artifact_name: string,
    root_id?: string
}) => {
    const artifacts = useSceneArtifacts();
    const [artifactUrl] = createResource(
        () => props.artifact_name, 
        async (path) => props.root_id ? artifacts.fetchArtifact(props.root_id, path) : undefined
    );

    return (
        <div class="artifact-container">
            <Show when={artifactUrl.loading}>
                <span>Carregando artefato...</span>
            </Show>

            <Show when={artifactUrl.error}>
                <span>Erro ao carregar imagem.</span>
            </Show>

            <Show when={artifactUrl()}>
                {(url) => (
                    <img src={url()} />
                )}
            </Show>
        </div>
    );
};