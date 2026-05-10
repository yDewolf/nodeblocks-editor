import { createMemo, Match, Switch } from "solid-js";
import { DataTypes } from "~/wrapper/nodes/data/node-data-type";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ArrayView } from "./array-output";

export const ScalarView = (props: { output_value: any | undefined }) => {
    // console.log("Scalar: ", props.value_map);
    return (<span class="node-output output-text">{String(props.output_value)}</span>)
};


export const NodeOutput = (props: {node: GraphNode}) => {
    // Output do node: props.node.last_output (Map<NodeSlot, any>)
    const firstOutput = createMemo(() => {
        const entries = Array.from(props.node.last_output.entries());
        if (entries.length == 0) {
            return null;
        }

        const output = entries[0];
        return output;
    });

    const outputType = createMemo(() => {
        const out = firstOutput();
        if (!out) return undefined;
        const slot = props.node.get_slot(out[0])

        return slot?.data_type.super_type ?? DataTypes.UNKNOWN;
    });

    return (
        <div class="node-output node-output-container">
            <Switch fallback={<span class="none">No Output</span>}>
                <Match when={
                    outputType() === DataTypes.FLOAT || 
                    outputType() === DataTypes.INT || 
                    outputType() === DataTypes.UINT
                }>
                    <ScalarView output_value={firstOutput()?.[1]} />
                </Match>

                <Match when={outputType() === DataTypes.ARRAY}>
                    <ArrayView output_value={firstOutput()?.[1]} />
                </Match>

                <Match when={outputType() === DataTypes.CUSTOM}>
                    <div class="custom-view">JSON: {JSON.stringify(firstOutput()?.[1])}</div>
                </Match>
                <Match when={outputType() === DataTypes.UNKNOWN}>
                    <span>Can't render Unknown Type</span>
                </Match>
            </Switch>
        </div>
    );
}