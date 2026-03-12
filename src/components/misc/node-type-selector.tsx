import { createMemo, For, mapArray } from "solid-js";
import { SceneController } from "../editor/controllers/scene-controller";
import { NodePreview } from "./node-preview";
import { CustomNodeConstructor } from "~/helpers/node-constructor";

export class NodeTypeSelector {
    public View(scene_controller: SceneController, onClickOnPreview: (node_preview: NodePreview) => void) {
        const constructors = createMemo(() => {
            scene_controller.node_type_reader.keep_track();
            return Array.from(scene_controller.node_type_reader.node_constructors.values());
        });
        
        const node_previews = mapArray(constructors, (constructor) => {
            return new NodePreview(constructor);
        });

        return (<div class="node-type-selector">
            <For each={node_previews()}>
                {(item) => item.View(onClickOnPreview)}
            </For>
        </div>);
    }
}