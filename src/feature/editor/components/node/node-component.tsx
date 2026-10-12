import { onCleanup, createMemo, Show, createSignal, For } from "solid-js";
import { DropdownIcon, DropdownSection } from "~/components/panels/dropdown";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { useScene } from "~/feature/scene/scene-context";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { NodeInstanceFactory } from "../../engine/helpers/node-instance-factory";
import { NodeAnchor } from "./node-anchors";
import { NodeOutput } from "./output/node-output";
import { SlotComponent } from "./slot-components";

// TODO: create a setting for this
const USE_ANCHORED_NODES: boolean = true;

export const NodeComponent = (props: { 
    node: SceneNode,
    // camera: EditorCamera,
    // workspace: UserWorkspace,
    // notification_controller: NotificationController,
    // onClick: (node: GraphNode) => void, 
    // onHoverNode: (node: GraphNode) => void, 
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void,
    // syncParameter: (node: GraphNode, parameter: NodeParameter) => void
}) => {
    const { actionController } = useScene();
    const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
            setTimeout(() => {
                props.node.size = {
                    x:  entry.contentRect.width, 
                    y: entry.contentRect.height
                };
            }, 0)
        }
    });
    const handleRef = (el: HTMLDivElement) => {
        const rect = el.getBoundingClientRect();
        props.node.size = {
            x: rect.width, // / props.camera.zoom, 
            y: rect.height // / props.camera.zoom
        };

        ro.observe(el);
    };
    onCleanup(() => ro?.disconnect());
    const isVisible = createMemo(() => {
        return true;
        //     return props.camera.camera_rect.overlaps(props.node.rect);
    });
    
    return (
            <Show when={isVisible()}>
                <div 
                    has-docs={true}
                    ref={(el) => handleRef(el)}
                    style={{
                        position: "absolute",
                        transform: `translate(${props.node.position.x}px, ${props.node.position.y}px)`,
                        // "pointer-events": "none"
                    }}
                    classList={{
                        "unsynced": !actionController.isEntityPending(props.node.uid),
                        // "failed": props.node.has_failed_action,
                        // "current-step": props.node.is_current_step,
                        "selected-mode": props.node.isSelected,
                    }}
                >   
                    <NodeComponentV2
                        node={props.node} 
                        // workspace={props.workspace}

                        // syncParameter={props.syncParameter}
                        // onClick={props.onClick} 
                        // onHover={props.onHoverNode} 
                        // onClickSlot={props.onClickSlot} 
                        // onHoverSlot={props.onHoverSlot}
                    />
                    {/* <NotificationPopupHolder 
                        notification_controller={props.notification_controller}
                        notifications={props.notification_controller.relatedToNode(props.node)}
                        pos={{x: 0, y: props.node.rect.size.y}}
                    /> */}
                </div>
            </Show>
        );
};

export const NodePreview = (props: {spec: NodeTypeSpec}) => {
    return (
        <NodeComponentV2
            spec={props.spec}
            // workspace={undefined}
            // onClick={(node) => undefined}
            // onHover={(node) => undefined}
            // onClickSlot={(slot) => undefined}
            // onHoverSlot={(slot) => undefined}
            // syncParameter={(node, parameter) => undefined}
            default_show_output={false}
            default_show_slot_labels={true}
        />
    )
}

export const NodeComponentV2 = (props: {
    node?: SceneNode, spec?: NodeTypeSpec
    // workspace: UserWorkspace | undefined,
    // onClick: (node: GraphNode) => void, 
    // onHover: (node: GraphNode) => void,
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void,
    // syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    default_show_output?: boolean
    default_show_slot_labels?: boolean
}) => {
    let ref_node = props.node;
    if (!ref_node && props.spec) {
        ref_node = new SceneNode(NodeInstanceFactory.fromSpec(props.spec));
    } 
    if (!ref_node) {
        throw new Error("Reference node can't be undefined on NodeComponent. 'node' field or 'constructor' should be set");
    }
    // const node_meta = metadata.get_node_meta(ref_node.fqn);
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
                "selected-mode": ref_node.isSelected
            }}
        >
            <div class="node-contents">
                <NodeHeader 
                    node={ref_node} 
                    // node_meta={node_meta}
                    isExpanded={isExpanded()} 
                    setExpanded={setIsExpanded}
                    setIsHovered={setIsHovered}
                    // onClick={props.onClick}
                    // onHover={props.onHover}
                />
                <NodeBody 
                    show_slots={isExpanded() || isHovered()} 
                    show_sections={isExpanded()} 
                    node={ref_node}
                    // node_meta={node_meta}
                    // workspace={props.workspace}
                    // syncParameter={props.syncParameter}
                    // onClickSlot={props.onClickSlot}
                    // onHoverSlot={(slot: NodeSlot) => {
                    //     setIsHovered(true);
                    //     props.onHoverSlot(slot);
                    // }}
                />
                {/* FIXME: contexto com os outputs do slot */}
                {/* <Show when={(!isExpanded() && ref_node.last_output.size != 0) || props.default_show_output && !isExpanded()}>
                    <NodeOutput node={ref_node}/>
                </Show> */}
            </div>
            <Show when={!isExpanded() && !isHovered()}>
                <div class="slot-grid-overlay">
                    <Show when={USE_ANCHORED_NODES} fallback={
                        <SlotGrid node={ref_node} slot_label={false} /> //node_meta={node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/>
                    }>
                        <AnchoredSlotGrid node={ref_node} /> 
                        {/* node_meta={node_meta} onClickSlot={props.onClickSlot} onHoverSlot={props.onHoverSlot}/> */}
                    </Show>
                </div>
            </Show>
        </div>
    )  
}

const NodeHeader = (props: {
    node: SceneNode, 
    // node_meta?: NodeTypeMeta, 
    isExpanded: boolean, 
    setExpanded: (value: boolean) => void, 
    setIsHovered: (value: boolean) => void,
    // onClick: (node: GraphNode) => void, 
    // onHover: (node: GraphNode) => void
}) => {
    return (
        <div
            class="node-header space-between"
            onPointerDown={(e) => {
                if (e.button != 0) {
                    return;
                }
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                // props.onClick(props.node);
            }}
            onMouseOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                props.setIsHovered(true);
                // props.onHover(props.node);
            }}
        >
            {/* <span>{props.node_meta?.capitalized_name ?? props.node.fqn}</span> */}
            <span>{props.node.fqn}</span>
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
    node: SceneNode, 
    // node_meta?: NodeTypeMeta, 
    show_slots: boolean, 
    show_sections: boolean,
    // workspace: UserWorkspace | undefined,
    // syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void
}) => {
    return (
        <div
            class="node-body"
        >
            <Show when={props.show_slots}>
                <SlotGrid 
                    node={props.node} 
                    slot_label={true} 
                    // node_meta={props.node_meta} 
                    // onClickSlot={props.onClickSlot} 
                    // onHoverSlot={props.onHoverSlot}
                />
            </Show>
            <Show when={props.show_sections}>
                <NodeBodySections 
                    node={props.node} 
                    // workspace={props.workspace} 
                    // node_meta={props.node_meta} 
                    // syncParameter={props.syncParameter}
                />
            </Show>
        </div>
    )
}

const SlotGrid = (props: {
    node: SceneNode,
    slot_label: boolean,
    // node_meta?: NodeTypeMeta,
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void
}) => {

    return (
        <div class="slot-grid">
            <div class="slot-grid-column">
                <For each={props.node.input_slots}>
                    {(slot) => {
                        return <SlotComponent slot={slot} show_label={true} highlightable={true}/>
                    }}
                </For>
            </div>
            <div class="slot-grid-column">
                <For each={props.node.output_slots}>
                    {(slot) => {
                        return <SlotComponent slot={slot} show_label={true} highlightable={true}/>
                    }}
                </For>
            </div>
        </div>
    )
}

const AnchoredSlotGrid = (props: {
    node: SceneNode,
    // node_meta?: NodeTypeMeta,
    // onClickSlot: (slot: NodeSlot) => void, 
    // onHoverSlot: (slot: NodeSlot) => void
}) => {
    return (
        <div class="anchored-slot-grid">
            <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={props.node.all_slots}/>
            <div class="side-anchors">
                <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={props.node.all_slots}/>
                <div></div>
                <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={props.node.all_slots}/>
            </div>
            <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={props.node.all_slots}/>
        </div>
    )
}

export const NodeBodySections = (props: {
    node: SceneNode, 
    // workspace: UserWorkspace | undefined,
    // syncParameter: (node: GraphNode, parameter: NodeParameter) => void,
    // node_meta?: NodeTypeMeta
}) => {
    return (
        <div class="node-body-sections container fill">
            <Show when={Object.keys(props.node.parameters).length > 0}>
                <DropdownSection header="Parameters" content={
                    <div class="field-grid-holder">
                        <For each={Object.values(props.node.parameters)}>
                            {
                                () => {
                                    return <span>Not implemented</span>
                                }
                            }
                            {/* {(parameter: NodeParameter) => <NodeFieldSelector
                                    node={props.node}
                                    workspace={props.workspace}
                                    parameter={parameter}
                                    parameter_sync={() => {
                                        props.syncParameter(props.node, parameter)
                                    }}
                                />
                            } */}
                        </For>    
                    </div>
                }/>
            </Show>
            {/* <DropdownSection 
                header="Output" 
                content={
                    <NodeOutput node={props.node}/>
                }
                default_expanded={true}
            /> */}
        </div>
    )
}