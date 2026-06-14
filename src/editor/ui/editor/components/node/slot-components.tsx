import { Show } from "solid-js";
import { metadata } from "~/singletons/metadata";
import { SlotData } from "~/wrapper/helpers/node-type-file";
import { NodeTypeMeta, SlotMeta } from "~/wrapper/metadata/type_metadata";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

// TODO: Reference this on NodeSlot and stop using NodeSlot.View()
// export const SlotComponentReferences = new ReactiveMap<NodeSlot, Array<SlotComponent>>();
export class SlotComponent {
    slot: NodeSlot;
    node_meta: NodeTypeMeta;
    slot_meta?: SlotMeta

    constructor(slot: NodeSlot, node_meta?: NodeTypeMeta) {
        this.slot = slot;
        this.node_meta = node_meta ? node_meta : metadata.get_node_meta(this.slot.parent_node.type_id);;
        this.slot_meta = undefined;
        if (this.node_meta) {
            this.slot_meta = this.node_meta.slot_meta[this.slot.slot_id]
        }
        
        // const components = SlotComponentReferences.get(this.slot) ?? [];
        // SlotComponentReferences.set(this.slot, [...components, this]);
    }

    public View = (
        set_reference: boolean,
        show_label: boolean,
        onClick: (slot: NodeSlot) => void,
        onHover: (slot: NodeSlot) => void
    ) => {
        return <_SlotComponent onHover={onHover} onClick={onClick} show_label={show_label} slot={this.slot}/>
    }

}
export const _SlotComponent = (props: {
    slot: NodeSlot,
    show_label: boolean,
    node_meta?: NodeTypeMeta,
    onClick: (slot: NodeSlot) => void,
    onHover: (slot: NodeSlot) => void,
}) => {
    const node_meta = props.node_meta ? props.node_meta : metadata.get_node_meta(props.slot.parent_node.type_id);
    const slot_meta = node_meta != undefined ? node_meta.slot_meta[props.slot.slot_id] : undefined;
    const slot_label = slot_meta ? slot_meta.capitalized_name : props.slot.slot_id;
    return (
        <div
            has-docs={true}
            onMouseOver={(e) => {
                e.stopPropagation();
                props.onHover(props.slot);
            }}
            title={slot_label}
            class="node-slot"
            classList={{
                "connected-slot": props.slot.connections.size > 0,
                "selected-slot": props.slot.selected,
                "input-slot": props.slot.is_input,
                "output-slot": !props.slot.is_input,
            }}
        >
            <div 
                ref={props.slot._element}
                class="slot-dot"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    props.onClick(props.slot);
                }}
            ></div>
            <Show when={props.show_label}>
                <span class="slot-label">{slot_label}</span>
            </Show>
        </div>
    )
}

export const SlotHeader = (props: {
    slot_data: SlotData,
    slot_meta: SlotMeta,
    slot_id: string
}) => { 
    const slot_label = props.slot_meta ? props.slot_meta.capitalized_name : props.slot_id;
    return (
        <div 
            class="node-slot"
            classList={{
                "input-slot": props.slot_data.is_input,
                "output-slot": !props.slot_data.is_input,
            }}
        >
            <div class="slot-dot"></div>
            <span class="slot-label">{slot_label}</span>
        </div>
    )
}