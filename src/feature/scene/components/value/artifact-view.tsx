import { createResource, Show } from "solid-js";
import { useSceneArtifacts } from "~/feature/editor/contexts/artifact-context";
import { useI18n } from "~/i18n/i18n-context";


// TODO: style
// TODO: pensar sobre esse root_id
export const ArtifactView = (props: {
    artifact_name: string,
    root_id?: string
}) => {
    const { t } = useI18n();
    const artifacts = useSceneArtifacts();
    const [artifactUrl] = createResource(
        () => props.artifact_name, 
        async (path) => props.root_id ? artifacts.fetchArtifact(props.root_id, path) : undefined
    );

    return (
        <div class="artifact-container">
            <Show when={artifactUrl.loading}>
                <span>{t("messages.loading", t("words.artifact"))}</span>
            </Show>

            <Show when={artifactUrl.error}>
                <span>{t("messages.errorWhile", t("actions.loadImage"))}</span>
            </Show>

            <Show when={artifactUrl()}>
                {(url) => (
                    <img src={url()} />
                )}
            </Show>
        </div>
    );
};