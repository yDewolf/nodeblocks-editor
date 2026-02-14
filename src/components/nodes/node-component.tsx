import { Component, createMemo, Show } from "solid-js";
import { Vector2 } from "~/data_types/geometry";
import { BaseNode } from "./base-node";

interface NodeProps {
    node: BaseNode;
    cameraOffset: Vector2; 
    screenSize: Vector2;
}

export const NodeView: Component<NodeProps> = (props) => {
    const relativePos = createMemo(() => ({
        x: props.node.x - props.cameraOffset.x,
        y: props.node.y - props.cameraOffset.y,
    }));

    console.log(props.cameraOffset)

    return (
        <Show when={true}>
            <div 
                style={{
                    position: "absolute",
                    left: `${relativePos().x}px`,
                    top: `${relativePos().y}px`,
                    "background-color": "white",
                    border: "1px solid black"
                }}
            >
                {props.node.node_name}
            </div>
        </Show>
    );
};