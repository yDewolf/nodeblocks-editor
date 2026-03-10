import { createMemo, For } from "solid-js";
import { SceneController } from "../editor/controllers/scene-controller";
import { NodePreview } from "./node-preview";

export class NodeTypeSelector {
    public View(scene_controller: SceneController) {
        const node_previews = createMemo(() => {
            let previews: NodePreview[] = [];
            scene_controller.node_type_reader.node_constructors.forEach((value) => {
                const preview = new NodePreview(value);
                previews.push(preview);
            })

            return previews
        });
        
        
        return (<div>
            <For each={node_previews()}>
                {(item) => item.View()}
            </For>
        </div>);
    }
}