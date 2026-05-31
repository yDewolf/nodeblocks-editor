import { Show } from "solid-js";
import { metadata } from "~/singletons/metadata";
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
        return (
            <div
                // FIXME: this might break referencing cause it overrides stuff etc etc
                onMouseOver={(e) => {
                    e.stopPropagation();
                    onHover(this.slot);
                }}
                class="node-slot"
                classList={{
                    "connected-slot": this.slot.connections.size > 0,
                    "selected-slot": this.slot.selected,
                    "input-slot": this.slot.is_input,
                    "output-slot": !this.slot.is_input,
                }}
            >
                <div 
                    ref={this.slot._element} 
                    class="slot-dot"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        onClick(this.slot);
                    }}
                ></div>
                <Show when={show_label}>
                    <span class="slot-label">{this.slot_meta ? this.slot_meta.capitalized_name : this.slot.slot_id}</span>
                </Show>
            </div>
        )
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
    return (
        <div
            onMouseOver={(e) => {
                e.stopPropagation();
                props.onHover(props.slot);
            }}
            class="node-slot"
            classList={{
                "connected-slot": props.slot.connections.size > 0,
                "selected-slot": props.slot.selected,
                "input-slot": props.slot.is_input,
                "output-slot": !props.slot.is_input,
            }}
        >
            <div 
                class="slot-dot"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    props.onClick(props.slot);
                }}
            ></div>
            <Show when={props.show_label}>
                <span class="slot-label">{slot_meta ? slot_meta.capitalized_name : props.slot.slot_id}</span>
            </Show>
        </div>
    )
}