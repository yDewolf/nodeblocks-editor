import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { NodeField } from "~/editor/ui/node/node-field";
import { NodeAnchor } from "../misc/node-anchors";
import { EditorCamera } from "~/editor/internal/editor-space";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { NodeOutput } from './output/node-output';
import { UserWorkspace } from "~/network/session/user-workspace";
import { NotificationPopupHolder } from '../misc/notification/notification-badges';
import { NotificationController } from "~/network/controllers/notification_controller";
import { metadata } from "~/singletons/metadata";
import { SlotComponent } from "./slot-components";
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { DropdownIcon, DropdownSection } from "../panels/base-panels";

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
    const node_meta = metadata.get_node_meta(props.node.type_id);

    return (
            <Show when={isVisible()}>
                <div 
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
                    class="node"
                >   
                    <NodeComponentV2 node={props.node} constructor={undefined} onClick={props.onClick} onHover={props.onHoverNode} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
                    {/* <NotificationPopupHolder 
                        notification_controller={props.notification_controller}
                        notifications={props.notification_controller.forNode(props.node.id)}
                        pos={{x: 0, y: props.node.rect.size.y}}
                    />
                    <Show when={is_compacted() && !is_hovered()}>
                        <div class="node-slots">
                            <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                            <div class="side-anchors">
                                <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                                <div></div>
                                <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                            </div>
                            <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                        </div>
                    </Show>
                    <div
                        class="internal-node"
                        onPointerDown={(e) => {
                            if (e.button != 0) {
                                return;
                            }
                            // FIXME: Stop Propagation shouldn't break PointerDown Cleanup
                            // e.stopPropagation();
                            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                            props.onClick(props.node);
                        }}
                        classList={{
                            "selected-mode": props.node.selected
                        }}
                    >
                        <div class="keep row-container space-between node-header" onpointerdown={(e) => {e.preventDefault()}}>
                            {node_meta != undefined ? node_meta.capitalized_name : props.node.type_id}
                            <span class="icon-span">
                                <button class="icon-button node-button" onclick={() => {

                                }}>
                                    <img src="public/assets/icons/arrow-down.svg" alt="" />
                                </button>
                            </span>
                        </div>
                        <div class="node-body">
                            <Show when={is_compacted() && is_hovered()}>
                                <div class="internal-node-slots">
                                    <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                                </div>
                            </Show>
                            <div class="node-content container">
                                <For each={props.node.node_data.parameters.values().toArray()}>
                                    {(parameter: NodeParameter) => <NodeField
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
                            <NodeOutput node={props.node}/>
                        </div>
                    </div> */}
                </div>
            </Show>
        );
};


export const NodeComponentV2 = (props: {
    node?: GraphNode, constructor?: BaseNodeConstructor, 
    onClick: (node: GraphNode) => void, 
    onHover: (node: GraphNode) => void,
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void
}) => {
    const ref_node = props.node ? props.node : props.constructor?.make_node("",{x: 0, y: 0});
    if (!ref_node) {
        throw new Error("Reference node can't be undefined on NodeComponent. 'node' field or 'constructor' should be set");
    }
    const node_meta = metadata.get_node_meta(ref_node.type_id);
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [isHovered, setIsHovered] = createSignal(false);

    return (
        <div
            class="nodev2 node"
            classList={{
                "expanded": isExpanded(),
                "hovered": isHovered()
            }}
        >
            <NodeHeader node={ref_node} isExpanded={isExpanded()} setExpanded={setIsExpanded} onClick={props.onClick} onHover={props.onHover}/>
            <NodeBody 
                show_slots={isExpanded() || isHovered()} 
                show_sections={isExpanded()} 
                node={ref_node}
                node_meta={node_meta}
                onClickSlot={props.onClickSlot}
                onHoverSlot={props.onHoverSlot}
            />
        </div>
    )  
}

const NodeHeader = (props: {
    node: GraphNode, 
    node_meta?: NodeTypeMeta, 
    isExpanded: boolean, 
    setExpanded: (value: boolean) => void, 
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
    onClickSlot: (slot: NodeSlot) => void, 
    onHoverSlot: (slot: NodeSlot) => void
}) => {
    return (
        <div
            class="node-body"
        >
            <Show when={props.show_slots}>
                <SlotGrid node={props.node} node_meta={props.node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
            </Show>
            <Show when={props.show_sections}>
                <NodeBodySections node={props.node} node_meta={props.node_meta}/>
            </Show>
        </div>
    )
}

const SlotGrid = (props: {
    node: GraphNode, 
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
                        return component.View(true, true, props.onClickSlot, props.onHoverSlot);
                    }}
                </For>
            </div>
            <div class="slot-grid-column">
                <For each={props.node.output_slots}>
                    {(slot) => {
                        const component = new SlotComponent(slot, props.node_meta);
                        return component.View(true, true, props.onClickSlot, props.onHoverSlot);
                    }}
                </For>
            </div>
        </div>
    )
}

const NodeBodySections = (props: {node: GraphNode, node_meta?: NodeTypeMeta}) => {
    return (
        // TODO
        <div class="node-body-sections">
            <DropdownSection header="Parameters" content={
                <div>

                </div>
            }/>
        </div>
    )
}