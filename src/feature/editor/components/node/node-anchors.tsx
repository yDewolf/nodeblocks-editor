import { createMemo, For } from "solid-js";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { SlotComponent } from "./slot-components";

export const NodeAnchor = (props: {
    anchor_pos: Vector2, 
    all_slots: SceneNodeSlot[],
    // node_meta?: NodeTypeMeta,
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void
}) => {
    const filtered_nodes = createMemo(() => {
        return props.all_slots.filter((slot) => slot.anchor.x == props.anchor_pos.x && slot.anchor.y == props.anchor_pos.y);
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
                    return (
                        <SlotComponent slot={slot} show_label={false} highlightable={true}/>
                    )
                }}
            </For>
        </div>
    );
};