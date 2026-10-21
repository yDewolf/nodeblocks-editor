import { Show } from "solid-js";
import { DocsPathPrefix } from "~/feature/docs/docs-protocols";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { useNodeMeta } from "~/feature/metadata/metadata-context";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { NodeSlotSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";
import { InputEvents } from "~/utils/events/event-handling";
import { useEventManager } from "~/utils/events/event-provider";

export const SlotComponent = (props: {
    slot: SceneNodeSlot,
    show_label: boolean,
    highlightable?: boolean,
}) => {
    const eventManager = useEventManager();
    const slot_meta = useNodeMeta()?.meta?.slot_meta;
    const slot_label = slot_meta ? slot_meta[props.slot.slot_id].capitalized_name : props.slot.slot_id;
    
    
    const datatype_fqn = props.slot.instance.data_type_fqn;
    const [package_id, id] = NamespaceUtils.splitFqn(datatype_fqn);

    return (
        <div
            has-docs={true}
            docs-prefix={DocsPathPrefix.NODE}
            docs-root={useNodeMeta()?.package_id}
            docs-id={useNodeMeta()?.type_id}
            docs-section={DocsPathUtils.makeSlotSectionId(props.slot.slot_id)}

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
                onPointerDown={(e) => {
                    // e.stopPropagation();
                    eventManager?.generalizedEventHandler({
                        slot: props.slot
                    }, InputEvents.CLICK_ON_NODE_SLOT);
                }}
                class="slot-dot"
            ></div>
            <Show when={props.show_label}>
                <span class="slot-label" classList={{"highlightable": props.highlightable}}>{slot_label}</span>
            </Show>
        </div>
    )
}

export const SlotHeader = (props: {
    slot_spec: NodeSlotSpec,
    slot_id: string,
    highlightable?: boolean,
}) => {
    const slot_meta = useNodeMeta()?.meta?.slot_meta;
    let slot_label = props.slot_id;
    if (slot_meta && props.slot_id in slot_meta) {
        slot_label = slot_meta[props.slot_id].capitalized_name;
    }
    return (
        <div 
            class="node-slot"
            classList={{
                "input-slot": props.slot_spec.is_input,
                "output-slot": !props.slot_spec.is_input,
            }}
        >
            <div class="slot-dot"></div>
            <span class="slot-label" classList={{"highlightable": props.highlightable}}>{slot_label}</span>
        </div>
    )
}