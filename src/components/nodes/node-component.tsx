import { Component, createMemo, onCleanup, onMount, Show } from "solid-js";
import { Vector2 } from "~/data_types/geometry";
import { BaseNode } from "./base-node";
import { EditorCamera } from "../editor/editor-space";

interface NodeProps {
    node: BaseNode;
    camera: EditorCamera;
    
    onClick: (node: BaseNode) => void;
}

export const NodeView: Component<NodeProps> = (props) => {
    let ro: ResizeObserver | undefined;
    const handleRef = (el: HTMLDivElement) => {
        const rect = el.getBoundingClientRect();
        props.node.updateSize(rect.width / props.camera.zoom, rect.height / props.camera.zoom);

        ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                props.node.updateSize(
                    entry.contentRect.width, 
                    entry.contentRect.height
                );
            }
        });
        console.log(props.node.rect.size)
        ro.observe(el);
    };

    onCleanup(() => ro?.disconnect());

    const isVisible = createMemo(() => {
        return props.camera.camera_rect.overlaps(props.node.rect);
    });

    return (
        <Show when={isVisible()}>
            <div
                ref={handleRef}
                data-node-id={props.node.id}
                class="node"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                    props.onClick(props.node);
                }}
                classList={{
                    "selected-mode": props.node.selected
                }}
                style={{
                    position: "absolute",
                    transform: `translate(${props.node.x}px, ${props.node.y}px)`,
                }}
            >
                {props.node.node_name}
            </div>
        </Show>
    );
};