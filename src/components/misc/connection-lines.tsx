import { createMemo } from "solid-js";
import { NodeConnection } from "../nodes/node-connection";
import { NodeSlot } from "../nodes/node-slot";
import { Vector2 } from "~/data_types/geometry";

function make_simple_curved_path(start: Vector2, end: Vector2) {
    const curvature = Math.abs(start.x - end.x) * 0.5;
    
    const curvature_start_x = start.x + curvature;
    const curvature_end_x = end.x - curvature;

    return `M ${start.x} ${start.y} C ${curvature_start_x} ${start.y} ${curvature_end_x} ${end.y} ${end.x} ${end.y}`;
}


export const ConnectionPreview = (props: { start_node: NodeSlot | null, cursor_pos: Vector2 }) => {
    const path = createMemo(() => {
        if (props.start_node == null) {
            return;
        }
        const start = props.start_node.get_world_position();
        const end = props.cursor_pos;

        return make_simple_curved_path(start, end);
    });

    return (
        <path class="connection-path-preview"
            d={path()}
        />
    );
};

export const ConnectionLines = (props: { connection: NodeConnection, onDisconnect: (connection: NodeConnection) => void }) => {
    const path = createMemo(() => {
        const start = props.connection.slot_a.get_world_position();
        const end = props.connection.slot_b.get_world_position();
        return make_simple_curved_path(start, end);
    });

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        props.onDisconnect(props.connection);
    };

    return (
        <g class={"connection-group"}>
            <path class="clickable-path"
                onContextMenu={handleContextMenu}
                d={path()}
            />
            <path class="connection-path"
                d={path()}
            />
        </g>
    );
};