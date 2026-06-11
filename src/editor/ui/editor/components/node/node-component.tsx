import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { EditorCamera } from "~/editor/internal/editor-space";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { NodeOutput, OutputSelector } from './output/node-output';
import { UserWorkspace } from "~/network/session/user-workspace";
import { NotificationController } from "~/network/controllers/notification_controller";
import { metadata } from "~/singletons/metadata";
import { SlotComponent } from "./slot-components";
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { NotificationPopupHolder } from "../misc/notification/notification-badges";
import { NodeAnchor } from "./node-anchors";
import { NodeFieldSelector } from "./node-field";
import { DropdownIcon, DropdownSection } from "../../../components/panels/dropdown";

// TODO: create a setting for this
const USE_ANCHORED_NODES: boolean = true;

export const NodeComponent = (props: { 
    node: GraphNode, 
    camera: EditorCamera,
    workspace: UserWorkspace,
    notification_controller: NotificationController,
    onClick: (node: GraphNode) => void, 
    onHoverNode: (node: GraphNode) => void, 
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void,
    syncParameter: (node: GraphNode, parameter: NodeParameter) => void
}) => {
    const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
            setTimeout(() => {
                props.node.updateSize(
                    entry.contentRect.width, 
                    entry.contentRect.height
                );
            }, 0)
        }
    });
    const handleRef = (el: HTMLDivElement) => {
        const rect = el.getBoundingClientRect();
        props.node.updateSize(rect.width / props.camera.zoom, rect.height / props.camera.zoom);

        ro.observe(el);
    };
    onCleanup(() => ro?.disconnect());
    const isVisible = createMemo(() => {
        return props.camera.camera_rect.overlaps(props.node.rect);
    });

    return (
            <Show when={isVisible()}>
                <div 
                    has-docs={true}
                    ref={(el) => handleRef(el)}
                    style={{
                        position: "absolute",
                        transform: `translate(${props.node.x}px, ${props.node.y}px)`,
                        // "pointer-events": "none"
                    }}
                    classList={{
                        "unsynced": !props.node.is_synced,
                        "failed": props.node.has_failed_action,
                        "current-step": props.node.is_current_step,
                        "selected-mode": props.node.selected,
                    }}
                >   
                    <NodeComponentV2 
                        node={props.node} 
                        constructor={undefined} 
                        workspace={props.workspace}

                        syncParameter={props.syncParameter}
                        onClick={props.onClick} 
                        onHover={props.onHoverNode} 
                        onClickSlot={props.onClickSlot} 
                        onHoverSlot={props.onHoverSlot}
                    />
                    <NotificationPopupHolder 
                        notification_controller={props.notification_controller}
                        notifications={props.notification_controller.forNode(props.node.id)}
                        pos={{x: 0, y: props.node.rect.size.y}}
                    />
                </div>
            </Show>
        );
};

export const NodePreview = (props: {constructor: BaseNodeConstructor}) => {
    return (
        <NodeComponentV2
            constructor={props.constructor}
            workspace={undefined}
            onClick={(node) => undefined}
            onHover={(node) => undefined}
            onClickSlot={(slot) => undefined}
            onHoverSlot={(slot) => undefined}
            syncParameter={(node, parameter) => undefined}
            default_show_output={false}
            default_show_slot_labels={true}
        />
    )
}

export const NodeComponentV2 = (props: {
    node?: GraphNode, constructor?: BaseNodeConstructor, 
    workspace: UserWorkspace | undefined,
    onClick: (node: GraphNode) => void, 
    onHover: (node: GraphNode) => void,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void,
    syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    default_show_output?: boolean
    default_show_slot_labels?: boolean
}) => {
    const ref_node = props.node ? props.node : props.constructor?.make_node("",{x: 0, y: 0});
    if (!ref_node) {
        throw new Error("Reference node can't be undefined on NodeComponent. 'node' field or 'constructor' should be set");
    }
    const node_meta = metadata.get_node_meta(ref_node.type_id);
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [isHovered, setIsHovered] = createSignal(props.default_show_slot_labels ?? false);

    props.default_show_output = props.default_show_output ?? true;
    return (
        <div
            class="node"
            onMouseLeave={(e) => {
                setIsHovered(false);
            }}
            classList={{
                "expanded": isExpanded(),
                "hovered": isHovered(),
                "selected-mode": ref_node.selected
            }}
        >
            <div class="node-contents">
                <NodeHeader 
                    node={ref_node} 
                    node_meta={node_meta}
                    isExpanded={isExpanded()} 
                    setExpanded={setIsExpanded}
                    setIsHovered={setIsHovered}
                    onClick={props.onClick}
                    onHover={props.onHover}
                />
                <NodeBody 
                    show_slots={isExpanded() || isHovered()} 
                    show_sections={isExpanded()} 
                    node={ref_node}
                    node_meta={node_meta}
                    workspace={props.workspace}
                    syncParameter={props.syncParameter}
                    onClickSlot={props.onClickSlot}
                    onHoverSlot={(slot: NodeSlot) => {
                        setIsHovered(true);
                        props.onHoverSlot(slot);
                    }}
                />
                <Show when={(!isExpanded() && ref_node.last_output.size != 0) || props.default_show_output && !isExpanded()}>
                    <NodeOutput node={ref_node}/>
                </Show>
            </div>
            <Show when={!isExpanded() && !isHovered()}>
                <div class="slot-grid-overlay">
                    <Show when={USE_ANCHORED_NODES} fallback={
                        <SlotGrid node={ref_node} slot_label={false} node_meta={node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
                    }>
                        <AnchoredSlotGrid node={ref_node} node_meta={node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
                    </Show>
                </div>
            </Show>
        </div>
    )  
}

const NodeHeader = (props: {
    node: GraphNode, 
    node_meta?: NodeTypeMeta, 
    isExpanded: boolean, 
    setExpanded: (value: boolean) => void, 
    setIsHovered: (value: boolean) => void,
    onClick: (node: GraphNode) => void, 
    onHover: (node: GraphNode) => void
}) => {
    return (
        <div
            class="node-header space-between"
            onPointerDown={(e) => {
                if (e.button != 0) {
                    return;
                }
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                props.onClick(props.node);
            }}
            onMouseOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                props.setIsHovered(true);
                props.onHover(props.node);
            }}
        >
            <span>{props.node_meta?.capitalized_name ?? props.node.type_id}</span>
            <button 
                class="icon-button" 
                onPointerDown={(e) => e.stopPropagation()}
                onclick={() => {if (props.isExpanded) {props.setExpanded(false)} else {props.setExpanded(true)}}}
            >
                <DropdownIcon expanded={props.isExpanded}/>
            </button>
        </div>
    )
}

const NodeBody = (props: {
    node: GraphNode, 
    node_meta?: NodeTypeMeta, 
    show_slots: boolean, 
    show_sections: boolean,
    workspace: UserWorkspace | undefined,
    syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void
}) => {
    return (
        <div
            class="node-body"
        >
            <Show when={props.show_slots}>
                <SlotGrid slot_label={true} node={props.node} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
            </Show>
            <Show when={props.show_sections}>
                <NodeBodySections workspace={props.workspace} node={props.node} node_meta={props.node_meta} syncParameter={props.syncParameter}/>
            </Show>
        </div>
    )
}

const SlotGrid = (props: {
    node: GraphNode,
    slot_label: boolean,
    node_meta?: NodeTypeMeta,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void
}) => {
    return (
        <div class="slot-grid">
            <div class="slot-grid-column">
                <For each={props.node.input_slots}>
                    {(slot) => {
                        const component = new SlotComponent(slot, props.node_meta);
                        return component.View(true, props.slot_label, props.onClickSlot, props.onHoverSlot);
                    }}
                </For>
            </div>
            <div class="slot-grid-column">
                <For each={props.node.output_slots}>
                    {(slot) => {
                        const component = new SlotComponent(slot, props.node_meta);
                        return component.View(true, props.slot_label, props.onClickSlot, props.onHoverSlot);
                    }}
                </For>
            </div>
        </div>
    )
}

const AnchoredSlotGrid = (props: {
    node: GraphNode,
    node_meta: NodeTypeMeta,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void}
) => {
    return (
        <div class="anchored-slot-grid">
            <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={props.node.all_slots} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
            <div class="side-anchors">
                <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={props.node.all_slots} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
                <div></div>
                <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={props.node.all_slots} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
            </div>
            <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={props.node.all_slots} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
        </div>
    )
}

export const NodeBodySections = (props: {
    node: GraphNode, 
    workspace: UserWorkspace | undefined,
    syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    node_meta?: NodeTypeMeta
}) => {
    return (
        // TODO
        <div class="node-body-sections container fill">
            <Show when={props.node.node_data.parameters.size > 0}>
                <DropdownSection header="Parameters" content={
                    <div class="field-grid-holder">
                        <For each={props.node.node_data.parameters.values().toArray()}>
                            {(parameter: NodeParameter) => <NodeFieldSelector
                                    node={props.node}
                                    workspace={props.workspace}
                                    parameter={parameter}
                                    parameter_sync={() => {
                                        props.syncParameter(props.node, parameter)
                                    }}
                                />
                            }
                        </For>    
                    </div>
                }/>
            </Show>
            <DropdownSection 
                header="Output" 
                content={
                    <NodeOutput node={props.node}/>
                }
                default_expanded={true}
            />
        </div>
    )
}