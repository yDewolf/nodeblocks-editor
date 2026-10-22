import { onCleanup, createMemo, Show, createSignal, For, createEffect } from "solid-js";
import { DropdownIcon, DropdownSection } from "~/components/panels/dropdown";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { useScene } from "~/feature/scene/scene-context";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { NodeAnchor } from "./node-anchors";
import { NodeOutput } from "./node-output";
import { SlotComponent } from "./slot-components";
import { useEventManager } from "~/utils/events/event-provider";
import { InputEvents } from "~/utils/events/event-handling";
import { useSceneCanvas } from "~/feature/scene/scene-canvas-context";
import { nodeHasOutput, useSceneRuntime } from "~/feature/scene/scene-runtime-context";
import { DataTypeFieldSelector } from "../value/datatype-field";
import { NodeMetaProvider, useMetadata as useMetadata, useNodeMeta } from "~/feature/metadata/metadata-context";
import { DocsPathPrefix } from "~/feature/docs/docs-protocols";
import { NotificationPopupHolder } from "~/feature/editor/components/notification-badges";
import { useNotifications } from "~/feature/editor/contexts/notification-context";
import { editorSettings } from "~/feature/editor/editor-settings";
import { NodeInstanceFactory } from "~/feature/editor/engine/helpers/node-instance-factory";

// TODO: create a setting for this
const USE_ANCHORED_NODES: boolean = true;

export const NodeComponent = (props: { 
    node: SceneNode,
}) => {
    const { actionController } = useScene();
    const { canvasSpace } = useSceneCanvas();
    const runtime = useSceneRuntime();

    const isVisible = createMemo(() => {
        return canvasSpace.camera.camera_rect.overlaps(props.node.rect);
    });

    const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
            if (!isVisible()) {
                return;
            }

            props.node.size = {
                x: entry.contentRect.width, 
                y: entry.contentRect.height
            };
        }
    });

    const handleRef = (el: HTMLDivElement) => {
        const rect = el.getBoundingClientRect();
        props.node.size = {
            x: rect.width,
            y: rect.height
        }
        
        // const rounded_size = canvasSpace.grid.roundVector({x: rect.width, y: rect.height});
        // props.node.minSize = rounded_size;
        ro.observe(el);
    };
    onCleanup(() => ro?.disconnect());

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
                    "unsynced": actionController.isEntityPending(props.node.uid),
                    // "failed": props.node.has_failed_action,
                    "current-step": runtime?.isNodeLatestProcessed(props.node.uid),
                    "selected-mode": props.node.isSelected,
                }}
            >   
                <NodeComponentV2 node={props.node}/>
                <NotificationPopupHolder 
                    notifications={useNotifications().relatedToNode(props.node)}
                    pos={{x: 0, y: props.node.rect.size.y}}
                />
            </div>
        </Show>
    );
};

export const NodePreview = (props: {spec: NodeTypeSpec}) => {
    return (
        <NodeComponentV2
            spec={props.spec}
            default_show_output={false}
            default_show_slot_labels={true}
        />
    )
}

export const NodeComponentV2 = (props: {
    node?: SceneNode, spec?: NodeTypeSpec
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

    createEffect(() => {
        setIsHovered(editorSettings.alwaysShowSlotLabels);
    })

    props.default_show_output = props.default_show_output ?? true;
    return (
        <NodeMetaProvider value={useMetadata().get_node_meta(ref_node.instance.spec.id, ref_node.instance.spec.namespace)} package_id={ref_node.instance.spec.namespace} type_id={ref_node.instance.spec.id}>
            <div
                class="node"

                docs-prefix={DocsPathPrefix.NODE}
                docs-root={ref_node.instance.spec.namespace}
                docs-id={ref_node.instance.spec.id}

                onMouseLeave={(e) => {
                    if (editorSettings.alwaysShowSlotLabels) return;
                    setIsHovered(false);
                }}
                classList={{
                    "expanded": isExpanded(),
                    "hovered": isHovered(),
                    "selected-mode": ref_node.isSelected
                }}
                // style={{
                    //     "min-width": `${ref_node.minSize.x}px`,
                //     "min-height": `${ref_node.minSize.y}px`
                // }}
                >
                <div class="node-contents">
                    <NodeHeader 
                        node={ref_node} 
                        isExpanded={isExpanded()} 
                        setExpanded={setIsExpanded}
                        setIsHovered={setIsHovered}
                    />
                    <NodeBody 
                        show_slots={isExpanded() || isHovered()} 
                        show_sections={isExpanded()} 
                        node={ref_node}
                    />
                    <Show when={(!isExpanded() && nodeHasOutput(ref_node.uid)) || props.default_show_output && !isExpanded()}>
                        <NodeOutput node={ref_node}/>
                    </Show>
                </div>
                <Show when={!isExpanded() && !isHovered()}>
                    <div class="slot-grid-overlay">
                        <Show when={USE_ANCHORED_NODES} fallback={
                            <SlotGrid node={ref_node} slot_label={false} />
                        }>
                            <AnchoredSlotGrid node={ref_node} /> 
                        </Show>
                    </div>
                </Show>
            </div>
        </NodeMetaProvider>
    )  
}

const NodeHeader = (props: {
    node: SceneNode, 
    isExpanded: boolean, 
    setExpanded: (value: boolean) => void, 
    setIsHovered: (value: boolean) => void,
}) => {
    const eventManager = useEventManager();
    return (
        <div
            class="node-header space-between"
            onPointerDown={(e) => {
                if (e.button != 0) {
                    return;
                }
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                eventManager?.generalizedEventHandler({
                    node: props.node,
                }, InputEvents.CLICK_ON_NODE);
            }}
            onMouseOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                props.setIsHovered(true);
                eventManager?.generalizedEventHandler({
                    node: props.node,
                }, InputEvents.HOVER_NODE);
            }}
        >
            <span>{useNodeMeta()?.meta?.capitalized_name ?? props.node.fqn}</span>
            {/* <span>{props.node.fqn}</span> */}
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
    show_slots: boolean, 
    show_sections: boolean,
}) => {
    return (
        <div
            class="node-body"
        >
            <Show when={props.show_slots}>
                <SlotGrid node={props.node} slot_label={true}/>
            </Show>
            <Show when={props.show_sections}>
                <NodeBodySections node={props.node}/>
            </Show>
        </div>
    )
}

const SlotGrid = (props: {
    node: SceneNode,
    slot_label: boolean,
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
}) => {
    return (
        <div class="anchored-slot-grid">
            <NodeAnchor anchor_pos={{x: 0, y: -1}} node={props.node}/>
            <div class="side-anchors">
                <NodeAnchor anchor_pos={{x: -1, y: 0}} node={props.node}/>
                <div></div>
                <NodeAnchor anchor_pos={{x: 1, y: 0}} node={props.node}/>
            </div>
            <NodeAnchor anchor_pos={{x: 0, y: 1}} node={props.node}/>
        </div>
    )
}

export const NodeBodySections = (props: {
    node: SceneNode, 
}) => {
    return (
        <div class="node-body-sections container fill">
            <Show when={Object.keys(props.node.parameters).length > 0}>
                <DropdownSection header="Parameters" content={
                    <div class="field-grid-holder">
                        <For each={Object.entries(props.node.parameterSpecs)}>
                            {([paramId, paramSpec]) => <DataTypeFieldSelector
                                    node={props.node}
                                    parameterId={paramId}
                                    parameterSpec={paramSpec}
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