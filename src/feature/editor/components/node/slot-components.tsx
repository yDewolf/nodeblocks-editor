import { Show } from "solid-js";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { NodeSlotSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { InputEvents } from "~/utils/events/event-handling";
import { useEventManager } from "~/utils/events/event-provider";

export const SlotComponent = (props: {
    slot: SceneNodeSlot,
    show_label: boolean,
    highlightable?: boolean,
}) => {
    // const node_meta = props.node_meta ? props.node_meta : metadata.get_node_meta(props.slot.parent_node.type_id);
    // const slot_meta = node_meta != undefined ? node_meta.slot_meta[props.slot.slot_id] : undefined;
    // const slot_label = slot_meta ? slot_meta.capitalized_name : props.slot.slot_id;
    const eventManager = useEventManager();
    const slot_label = props.slot.path.slot_id;

    return (
        <div
            has-docs={true}
            onMouseOver={(e) => {
                e.stopPropagation();
                eventManager?.generalizedEventHandler({
                    slot: props.slot
                }, InputEvents.HOVER_SLOT);
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
                ref={(el) => {
                    props.slot.element = el;
                    requestAnimationFrame(() => {
                        props.slot.forceUpdateLayout();
                    });
                }}
                class="slot-dot"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    eventManager?.generalizedEventHandler({
                        slot: props.slot
                    }, InputEvents.CLICK_ON_NODE_SLOT);
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