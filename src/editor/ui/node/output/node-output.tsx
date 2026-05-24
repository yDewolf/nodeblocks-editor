import { createMemo, createSignal, For, Match, Switch } from "solid-js";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ArrayView } from "./array-output";
import { ScalarView } from "./scalar-output";
import { DefaultRenderers } from "~/wrapper/nodes/data/node-data-type";

export const OutputSelector = (props: {output_renderer: DefaultRenderers | undefined, output_value: any | undefined}) => {
    return (
        <Switch fallback={<span class="none">No Output</span>}>
            <Match when={
                props.output_renderer === DefaultRenderers.SCALAR
            }>
                <ScalarView output_value={props.output_value?.[1]} />
            </Match>

            <Match when={props.output_renderer === DefaultRenderers.ARRAY}>
                <ArrayView output_value={props.output_value?.[1]}/>
            </Match>

            <Match when={props.output_renderer === DefaultRenderers.TEXT}>
                <div class="custom-view">JSON: {JSON.stringify(props.output_value?.[1])}</div>
            </Match>
            <Match when={props.output_renderer === DefaultRenderers.NOT_IMPLEMENTED}>
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

    const output_renderer = createMemo(() => {
        const out = targetOutput();
        if (!out) return undefined;
        const slot = props.node.get_slot(out[0])

        return slot?.data_type.renderer ?? DefaultRenderers.NOT_IMPLEMENTED;
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
                    {([slot_id, _]) => {
                        return (
                            <button 
                                class="icon-button selectable-button" 
                                classList={{"active": props.node.target_slot_output == slot_id}}
                                onclick={() => props.node.target_slot_output = slot_id}
                            >
                                {slot_id}
                            </button>
                        )
                    }}
                </For>
            </div>
            <div class="node-output node-output-container">
                <OutputSelector output_renderer={output_renderer()} output_value={targetOutput()}/>
            </div>
        </div>
    );
}