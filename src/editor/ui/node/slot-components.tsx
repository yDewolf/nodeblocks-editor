import { Show } from "solid-js";
import { metadata } from "~/singletons/metadata";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

// TODO: Reference this on NodeSlot and stop using NodeSlot.View()
export const SlotComponent = (props: {slot: NodeSlot, show_label: boolean, node_meta?: NodeTypeMeta}) => {
    const node_meta = props.node_meta ? props.node_meta : metadata.get_node_meta(props.slot.parent_node.type_id);
    const slot_meta = node_meta != undefined ? node_meta.slot_meta.get(props.slot.slot_id) : undefined;
    return (
        <div class="node-slot row-container">
            <Show when={props.show_label}>
                <span>{slot_meta ? slot_meta.capitalized_name : props.slot.slot_id}</span>
            </Show>
            <div 
                class="slot-dot"
                classList={{
                    "connected-slot": props.slot.connections.size > 0,
                    "selected-slot": props.slot.selected,
                    "input-slot": props.slot.is_input,
                    "output-slot": !props.slot.is_input,
                }}
            ></div>
        </div>
    )
}