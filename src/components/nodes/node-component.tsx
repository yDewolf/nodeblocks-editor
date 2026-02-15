import { Component, createMemo, Show } from "solid-js";
import { Vector2 } from "~/data_types/geometry";
import { BaseNode } from "./base-node";
import { EditorCamera } from "../editor/editor-space";

interface NodeProps {
    node: BaseNode;
    camera: EditorCamera;
    
    onClick: (node: BaseNode) => void;
}

export const NodeView: Component<NodeProps> = (props) => {
    const relativePos = createMemo(() => ({
        x: props.node.x - props.camera.offset.x,
        y: props.node.y - props.camera.offset.y,
    }));

    return (
        <Show when={true}>
            <div
                data-node-id={props.node.id}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                    props.onClick(props.node);
                }}
                style={{
                    position: "absolute",
                    transform: `translate(${relativePos().x}px, ${relativePos().y}px)`,
                    "background-color": "white",
                    border: "1px solid black",
                    "user-select": "none",
                    "touch-action": "none",
                    cursor: "grab"
                }}
            >
                {props.node.node_name}
            </div>
        </Show>
    );
};