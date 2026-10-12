import { For } from "solid-js";
import { useSceneCanvas } from "../../scene-canvas-context"
import { NodeComponent } from "~/feature/editor/components/node/node-component";
import "~/app.css";
import "~/style/containers.css";
import "~/style/screens/editor.css";
import {} from "~/feature/ui-themes";

export const TestSceneDisplayer = () => {
    const scene_canvas = useSceneCanvas();
    
    return (
        <div class="container">
            <For each={Object.values(scene_canvas.nodes)}>
                {(node) => {
                    return (
                        <NodeComponent node={node}/>
                    )
                }}
            </For>
        </div>
    )
}