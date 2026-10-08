import { For } from "solid-js";
import { useSceneCanvas } from "../../scene-canvas-context"

export const TestSceneDisplayer = () => {
    const scene_canvas = useSceneCanvas();
    
    return (
        <div class="container">
            <For each={Object.values(scene_canvas.nodes)}>
                {(node) => {
                    return (
                        <div>
                            <h2>{node.instance.fqn}</h2>
                            <p>{JSON.stringify(node.data)}</p>
                            <For each={Object.entries(node.parameters)}>
                                {([param_key, value]) => {
                                    return (
                                        <div class="container-row">
                                            <label>{param_key}</label>
                                            <input 
                                                onchange={(event) => {
                                                    const new_value = event.target.value;
                                                    node.setParam(param_key, new_value);
                                                }}
                                                type="text" 
                                                value={value}
                                            />
                                        </div>
                                    )
                                }}
                            </For>
                        </div>
                    )
                }}
            </For>
        </div>
    )
}