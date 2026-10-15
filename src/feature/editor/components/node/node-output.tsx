import { createMemo, createSignal, For } from "solid-js";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { nodeHasOutput, useSceneRuntime } from "~/feature/scene/scene-runtime-context";
import { DefaultDataTypes } from "~/old/wrapper/nodes/data/node-data-type";
import { useScene } from "~/feature/scene/scene-context";
import { DataTypeValueSelector } from "../../../scene/components/value/datatype-value-view";

export const NodeOutput = (props: {node: SceneNode}) => {
    const runtime = useSceneRuntime();
    const scene = useScene();
    const [targetOutputSlot, setTargetOutputSlot] = createSignal<string | undefined>(
        props.node.output_slots.at(0)?.slot_id
    );

    const targetOutput = createMemo(() => {
        if (!runtime) { 
            return undefined;
        }
        const outputs = runtime.getNodeOutputs(props.node.uid);
        const target = targetOutputSlot();
        
        if (!outputs || !target || !(target in outputs)) return undefined;

        const slot = props.node.slots[target];
        const datatype = scene.scene.registry.getDataTypeSpec(slot.instance.data_type_fqn);
        const value = outputs[target];
        
        return {
            renderer: datatype.default_renderer,
            base_type: datatype.base_id ?? DefaultDataTypes.UNKNOWN,
            value: value
        };
    });

    return (
        <div class="fill container output-displayer">
            <div 
                onpointerdown={(e) => {
                    e.stopPropagation();
                }}
                class="fill keep row-container output-selector" style={{"pointer-events": "auto"}}
            >
                <For each={(() => {
                    const outputs = runtime?.getNodeOutputs(props.node.uid);
                    return outputs ? Object.keys(outputs) : [];
                })()}>
                    {(slot_id) => {
                        return (
                            <button 
                                class="icon-button selectable-button" 
                                classList={{"active": targetOutputSlot() == slot_id}}
                                onclick={() => setTargetOutputSlot(slot_id)}
                            >
                                {slot_id}
                            </button>
                        )
                    }}
                </For>
            </div>
            <div class="node-output node-output-container">
                <DataTypeValueSelector value={targetOutput()}/>
            </div>
        </div>
    );
}