import { createMemo, For, onCleanup } from "solid-js";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { SlotComponent } from "./slot-components";
import { SceneNode } from "~/feature/scene/objects/scene-node";

export const NodeAnchor = (props: {
    anchor_pos: Vector2, 
    node: SceneNode
}) => {
    const filtered_slots = createMemo(() => {
        return props.node.all_slots.filter((slot) => slot.anchor.x == props.anchor_pos.x && slot.anchor.y == props.anchor_pos.y);
    })
    
    const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
            filtered_slots().forEach(slot => {
                slot.forceUpdateLayout();
            })
        }
    });

    onCleanup(() => {
        ro.disconnect();
    })

    return (
        <div 
            ref={(el) => ro.observe(el)}
            class="node-anchor" 
            classList={{
                "left-anchor": props.anchor_pos.x == -1,
                "right-anchor": props.anchor_pos.x == 1,
                "top-anchor": props.anchor_pos.y == -1,
                "bottom-anchor": props.anchor_pos.y == 1
            }}
        >
            <For each={filtered_slots()}>
                {(slot) => {
                    return (
                        <SlotComponent slot={slot} show_label={false} highlightable={true}/>
                    )
                }}
            </For>
        </div>
    );
};