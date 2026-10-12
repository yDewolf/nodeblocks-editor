import { Show } from "solid-js";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { NodeSlotSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";

export const SlotComponent = (props: {
    slot: SceneNodeSlot,
    show_label: boolean,
    highlightable?: boolean,
    // node_meta?: NodeTypeMeta,
    // onClick: (slot: NodeSlot) => void,
    // onHover: (slot: NodeSlot) => void,
}) => {
    // const node_meta = props.node_meta ? props.node_meta : metadata.get_node_meta(props.slot.parent_node.type_id);
    // const slot_meta = node_meta != undefined ? node_meta.slot_meta[props.slot.slot_id] : undefined;
    // const slot_label = slot_meta ? slot_meta.capitalized_name : props.slot.slot_id;
    const slot_label = props.slot.path.slot_id;
    return (
        <div
            has-docs={true}
            onMouseOver={(e) => {
                e.stopPropagation();
                // props.onHover(props.slot);
            }}
            title={slot_label}
            class="node-slot"
            classList={{
                "connected-slot": props.slot.connection_count > 0,
                "selected-slot": props.slot.isSelected,
                "input-slot": props.slot.isInput,
                "output-slot": !props.slot.isInput,
            }}
        >
            <div 
                ref={props.slot._element} 
                class="slot-dot"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    // props.onClick(props.slot);
                }}
            ></div>
            <Show when={props.show_label}>
                <span class="slot-label" classList={{"highlightable": props.highlightable}}>{slot_label}</span>
            </Show>
        </div>
    )
}

export const SlotHeader = (props: {
    slot_data: NodeSlotSpec,
    // slot_meta: SlotMeta,
    slot_id: string,
    highlightable?: boolean,
}) => { 
    // const slot_label = props.slot_meta ? props.slot_meta.capitalized_name : props.slot_id;
    const slot_label = props.slot_id;

    return (
        <div 
            class="node-slot"
            classList={{
                "input-slot": props.slot_data.is_input,
                "output-slot": !props.slot_data.is_input,
            }}
        >
            <div class="slot-dot"></div>
            <span class="slot-label" classList={{"highlightable": props.highlightable}}>{slot_label}</span>
        </div>
    )
}