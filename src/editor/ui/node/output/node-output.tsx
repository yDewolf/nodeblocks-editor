import { createMemo, For, Match, Switch } from "solid-js";
import { DataTypes, SuperSlotTypes } from "~/wrapper/nodes/data/node-data-type";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ArrayView } from "./array-output";
import { ScalarView } from "./scalar-output";

export const OutputSelector = (props: {output_type: DataTypes | undefined, output_value: any | undefined}) => {
    return (
        <Switch fallback={<span class="none">No Output</span>}>
            <Match when={
                props.output_type === DataTypes.FLOAT || 
                props.output_type === DataTypes.INT || 
                props.output_type === DataTypes.UINT
            }>
                <ScalarView output_value={props.output_value?.[1]} />
            </Match>

            <Match when={props.output_type === DataTypes.ARRAY}>
                <ArrayView output_value={props.output_value?.[1]} />
            </Match>

            <Match when={props.output_type === DataTypes.CUSTOM}>
                <div class="custom-view">JSON: {JSON.stringify(props.output_value?.[1])}</div>
            </Match>
            <Match when={props.output_type === DataTypes.UNKNOWN}>
                <span>Can't render Unknown Type</span>
            </Match>
        </Switch>
    )
}

export const NodeOutput = (props: {node: GraphNode}) => {
    // Output do node: props.node.last_output (Map<NodeSlot, any>)
    const targetOutput = createMemo(() => {
        const entries = Array.from(props.node.last_output.entries());
        if (entries.length == 0) {
            return null;
        }

        return [props.node.target_slot_output, props.node.last_output.get(props.node.target_slot_output)];
    });

    const outputType = createMemo(() => {
        const out = targetOutput();
        if (!out) return undefined;
        const slot = props.node.get_slot(out[0])

        return slot?.data_type.super_type ?? DataTypes.UNKNOWN;
    });

    return (
        <div class="fill container output-displayer">
            <div 
                onpointerdown={(e) => {
                    e.stopPropagation();
                }}
                class="fill keep row-container output-selector" style={{"pointer-events": "auto"}}
            >
                <For each={props.node.last_output.entries().toArray()}>
                    {([slot_name, _]) => {
                        return (
                            <button 
                                class="icon-button output-select-button" 
                                classList={{"active": props.node.target_slot_output == slot_name}}
                                onclick={() => props.node.target_slot_output = slot_name}
                            >
                                {slot_name}
                            </button>
                        )
                    }}
                </For>
            </div>
            <div class="node-output node-output-container">
                <OutputSelector output_type={outputType()} output_value={targetOutput()}/>
            </div>
        </div>
    );
}