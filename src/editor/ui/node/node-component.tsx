import { createMemo, For, onCleanup, Show } from "solid-js";
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

export const NodeComponent = (props: { 
    node: GraphNode, 
    camera: EditorCamera,
    workspace: UserWorkspace,
    notification_controller: NotificationController,
    onClick: (node: GraphNode) => void, 
    onClickOnSlot: (slot: NodeSlot) => void, 
    onHoverNode: (node: GraphNode) => void, 
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
                    ref={(el) => handleRef(el)}
                    onMouseOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        props.onHoverNode(props.node);
                    }}
                    style={{
                        position: "absolute",
                        transform: `translate(${props.node.x}px, ${props.node.y}px)`,
                        // "pointer-events": "none"
                    }}
                    classList={{
                        "unsynced": !props.node.is_synced,
                        "failed": props.node.has_failed_action,
                        "current-step": props.node.is_current_step
                    }}
                    class="node"
                >   
                    <NotificationPopupHolder 
                        notification_controller={props.notification_controller}
                        notifications={props.notification_controller.forNode(props.node.id)}
                        pos={{x: 0, y: props.node.rect.size.y}}
                    />
                    <div class="node-slots">
                        <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                        <div class="side-anchors">
                            <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                            <div></div>
                            <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                        </div>
                        <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={props.node.all_slots} onClickOnSlot={props.onClickOnSlot} onHoverSlot={props.onHoverSlot}/>
                    </div>
                     <div
                        class="internal-node"
                        data-node-id={props.node.id}
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
                        <div class="node-body">
                            <div class="node-header">{props.node.node_name}</div>
                            
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
                                {/* <div class="node-internal-data"> ... </div> */}
                            </div>
                            <NodeOutput node={props.node}/>
                        </div>
                    </div>
                </div>
            </Show>
        );
};