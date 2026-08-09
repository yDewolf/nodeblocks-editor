import { InterfaceElementMeta } from "~/network/controllers/docs/docs-interfaces";
import { SceneController } from "~/wrapper/controllers/scene-controller";

export const InterfaceDocsContent = (props: {
    path: string | undefined,
    data?: InterfaceElementMeta,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }

    return (
        <div class="keep fill container docs-sections">
            {/* Pensar no que colocar aqui */}
        </div>
    )
}