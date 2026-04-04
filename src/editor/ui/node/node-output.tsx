import { createMemo, Match, Switch } from "solid-js";
import { DataTypes } from "~/wrapper/nodes/data/node-data-type";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeComponent } from './node-component';

const ScalarView = (props: { value_map: Map<string, any> | undefined }) => {
    // console.log("Scalar: ", props.value_map);
    const value = props.value_map?.get("value");

    return (<span class="output-text">{String(value)}</span>)
};

const ArrayView = (props: { value_map: Map<string, any[]> | undefined }) => {
    // console.log("Array: ", props.value_map);
    const value = props.value_map?.get("value");

    return (<div class="output-array">
        {/* Pensar em como renderizar isso aqui */}
        Array({value?.length})
    </div>)
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
        if (!out) return DataTypes.UNKNOWN;
        const slot = props.node.get_slot(out[0])

        return slot?.data_type.super_type ?? DataTypes.UNKNOWN;
    });

    return (
        <div class="node-output-container">
            <Switch fallback={<span class="none">No Output</span>}>
                <Match when={
                    outputType() === DataTypes.FLOAT || 
                    outputType() === DataTypes.INT || 
                    outputType() === DataTypes.UINT
                }>
                    <ScalarView value_map={firstOutput()?.[1]} />
                </Match>

                <Match when={outputType() === DataTypes.ARRAY}>
                    <ArrayView value_map={firstOutput()?.[1]} />
                </Match>

                <Match when={outputType() === DataTypes.CUSTOM}>
                    <div class="custom-view">JSON: {JSON.stringify(firstOutput()?.[1])}</div>
                </Match>
            </Switch>
        </div>
    );
}