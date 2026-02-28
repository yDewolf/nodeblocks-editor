import { createMemo } from "solid-js";
import { NodeConnection } from "../nodes/node-connection";

export const ConnectionLines = (props: { connection: NodeConnection }) => {
    const path = createMemo(() => {
        const start = props.connection.slot_a.get_world_position();
        const end = props.connection.slot_b.get_world_position();
        const curvature = Math.abs(start.x - end.x) * 0.5;
        
        const curvature_start_x = start.x + curvature;
        const curvature_end_x = end.x - curvature;

        return `M ${start.x} ${start.y} C ${curvature_start_x} ${start.y} ${curvature_end_x} ${end.y} ${end.x} ${end.y}`;
    });

    return (
        <path 
            d={path()} 
            stroke="black" 
            stroke-width="2" 
            fill="none" 
            style={{ "pointer-events": "none" }} 
        />
    );
};