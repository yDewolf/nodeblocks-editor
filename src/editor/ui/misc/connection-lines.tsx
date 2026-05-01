import { createMemo } from "solid-js";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeConnection } from "~/wrapper/nodes/node-connection";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

export function make_simple_curved_path(start: Vector2, end: Vector2, anchor_a: Vector2, anchor_b: Vector2) {
    const intensity = 50;
    const curve_start = {
        x: start.x + (anchor_a.x * intensity),
        y: start.y + (anchor_a.y * intensity)
    };

    const curve_end = {
        x: end.x + (anchor_b.x * intensity),
        y: end.y + (anchor_b.y * intensity)
    };
    
    return `M ${start.x} ${start.y} C ${curve_start.x} ${curve_start.y} ${curve_end.x} ${curve_end.y} ${end.x} ${end.y}`;
}


export const ConnectionPreview = (props: { start_slot: NodeSlot | null, hovered_slot: NodeSlot | null, cursor_pos: Vector2 }) => {
    const path = createMemo(() => {
        if (props.start_slot == null) {
            return;
        }
        const start = props.start_slot.get_world_position();
        const anchor_a = props.start_slot.style.anchor;
        
        let end = props.cursor_pos;
        let anchor_b = anchor_a;
        if (props.hovered_slot != null && props.hovered_slot.can_connect_to(props.start_slot)) {
            end = props.hovered_slot.get_world_position();
            anchor_b = props.hovered_slot.style.anchor;
        }

        // FIXME: anchor_b should be hovered node
        return make_simple_curved_path(start, end, anchor_a, anchor_b);
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
        const anchor_a = props.connection.slot_a.style.anchor;
        const anchor_b = props.connection.slot_b.style.anchor;

        return make_simple_curved_path(start, end, anchor_a, anchor_b);
    });

    // TODO: Maybe change this to be a keybind idk or a tool function
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        props.onDisconnect(props.connection);
    };

    const is_current_step = createMemo(() => {
        const parent_node_step = props.connection.input_slot.parent_node.is_current_step;
        return parent_node_step;
    });

    return (
        <g 
            class={"connection-group"} 
            classList={{
                "unsynced": !props.connection.is_synced,
                "current-step": is_current_step()
            }}
        >
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