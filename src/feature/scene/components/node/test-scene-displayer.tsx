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
                        // <div>
                        //     <h2>{node.instance.fqn}</h2>
                        //     <p>{JSON.stringify(node.data)}</p>
                        //     <For each={Object.entries(node.parameters)}>
                        //         {([param_key, value]) => {
                        //             return (
                        //                 <div class="container-row">
                        //                     <label>{param_key}</label>
                        //                     <input 
                        //                         onchange={(event) => {
                        //                             const new_value = event.target.value;
                        //                             node.setParam(param_key, new_value);
                        //                         }}
                        //                         type="text" 
                        //                         value={value}
                        //                     />
                        //                 </div>
                        //             )
                        //         }}
                        //     </For>
                        // </div>
                    )
                }}
            </For>
        </div>
    )
}