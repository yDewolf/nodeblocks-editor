import { Vector2 } from "~/wrapper/data_types/geometry";
import { For, createMemo } from 'solid-js';
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { SlotComponent } from "../node/slot-components";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";

export const NodeAnchor = (props: {
    anchor_pos: Vector2, 
    all_slots: NodeSlot[],
    node_meta: NodeTypeMeta,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void
}) => {
    const filtered_nodes = createMemo(() => {
        return props.all_slots.filter((slot) => slot.style.anchor.x == props.anchor_pos.x && slot.style.anchor.y == props.anchor_pos.y);
    })
    
    return (
        <div class="node-anchor" classList={{
            "left-anchor": props.anchor_pos.x == -1,
            "right-anchor": props.anchor_pos.x == 1,
            "top-anchor": props.anchor_pos.y == -1,
            "bottom-anchor": props.anchor_pos.y == 1
        }}>
            <For each={filtered_nodes()}>
                {(slot) => {
                    const component = new SlotComponent(slot, props.node_meta);
                    return component.View(true, false, props.onClickSlot, props.onHoverSlot);
                }}
            </For>
        </div>
    );
};