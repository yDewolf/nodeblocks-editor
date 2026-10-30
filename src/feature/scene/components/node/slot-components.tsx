import { createEffect, createMemo, Show } from "solid-js";
import { DocsPathPrefix } from "~/feature/docs/docs-protocols";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { useMetadata, useNodeMeta } from "~/feature/metadata/metadata-context";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { NodeSlotSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { DataTypeStyle } from "~/protocols/nodeblocks/metadata/type_metadata";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";
import { InputEvents } from "~/utils/events/event-handling";
import { useEventManager } from "~/utils/events/event-provider";

interface SlotStyle {
    "--slot-border-color"?: string,
    "--slot-background-color"?: string,
}

export const SlotComponent = (props: {
    slot: SceneNodeSlot,
    show_label: boolean,
    highlightable?: boolean,
}) => {
    const metadata = useMetadata();
    const eventManager = useEventManager();
    const slot_meta = useNodeMeta()?.meta?.slot_meta;
    const slot_label = slot_meta ? slot_meta[props.slot.slot_id].capitalized_name : props.slot.slot_id;
    
    // TODO: talvez valha a pena implementar um sistema de cores
    // que recebe uma única cor e gera cor para output, input e para os backgrounds
    const datatype_fqn = props.slot.instance.data_type_fqn;
    const [package_id, id] = NamespaceUtils.splitFqn(datatype_fqn);
    const datatypeMeta = metadata?.get_datatype_meta(id, package_id,);
    
    const targetStyle = props.slot.isInput ? datatypeMeta?.inStyle : datatypeMeta?.outStyle;
    const slotStyle = makeSlotStyleFromDataTypeStyle(targetStyle);
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
                        slot: props.slot,
                        event: e
                    }, InputEvents.CLICK_ON_NODE_SLOT);
                }}
                class="slot-dot"
                style={slotStyle as Record<string, string>}
            ></div>
            <Show when={props.show_label}>
                <span class="slot-label" classList={{"highlightable": props.highlightable}}>{slot_label}</span>
            </Show>
        </div>
    )
}

export const ExampleNodeSlotDot = (props: {
    isInput: boolean,
    slotStyle?: SlotStyle | Record<string, string>
}) => {
    return (
         <div
            class="node-slot example"
            classList={{
                "input-slot": props.isInput,
                "output-slot": !props.isInput,
            }}
        >
            <div 
                class="slot-dot"
                style={props.slotStyle as Record<string, string>}
            ></div>
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


export function makeSlotStyleFromDataTypeStyle(targetStyle?: DataTypeStyle) {
    const slotStyle: SlotStyle = {};
    if (targetStyle?.color) {
        slotStyle["--slot-border-color"] = `rgb(${targetStyle.color.r},${targetStyle.color.g},${targetStyle.color.b})`;
        slotStyle["--slot-background-color"] = `rgb(${targetStyle.color.r * 0.1},${targetStyle.color.g * 0.1},${targetStyle.color.b * 0.1})`;
    }

    if (targetStyle?.backgroundColor) {
        slotStyle["--slot-background-color"] = `rgb(${targetStyle.backgroundColor.r},${targetStyle.backgroundColor.g},${targetStyle.backgroundColor.b})`;
    }

    return slotStyle;
}