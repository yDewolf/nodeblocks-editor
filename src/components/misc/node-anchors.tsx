import { Vector2 } from "~/data_types/geometry";
import { NodeSlot } from "../nodes/node-slot";
import { For, createMemo } from 'solid-js';

export const NodeAnchor = (props: { anchor_pos: Vector2, all_slots: NodeSlot[], onClickOnSlot: (slot: NodeSlot) => void, onHoverSlot: (slot: NodeSlot) => void}) => {
    const filtered_nodes = createMemo(() => {
        return props.all_slots.filter((slot) => slot.style.anchor.x == props.anchor_pos.x && slot.style.anchor.y == props.anchor_pos.y);
    })
    // console.log(props.anchor_pos, filtered_nodes);
    
    return (
        <div class="node-anchor" classList={{
            "left-anchor": props.anchor_pos.x == -1,
            "right-anchor": props.anchor_pos.x == 1,
            "top-anchor": props.anchor_pos.y == -1,
            "bottom-anchor": props.anchor_pos.y == 1
        }}>
            <For each={filtered_nodes()}>
                {(slot) => slot.View(props.onClickOnSlot, props.onHoverSlot)}
            </For>
        </div>
    );
};