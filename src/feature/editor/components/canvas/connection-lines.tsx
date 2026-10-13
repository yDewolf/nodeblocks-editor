import { createMemo } from "solid-js";
import { SceneConnection } from "~/feature/scene/objects/scene-connection";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { useSceneCanvas } from "~/feature/scene/scene-canvas-context";
import { useScene } from "~/feature/scene/scene-context";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { ConnActionPayload } from '../../../../protocols/nodeblocks/network/message/commands/node-graph-commands';

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


export const ConnectionPreview = (props: { start_slot: SceneNodeSlot | null, hovered_slot: SceneNodeSlot | null, cursor_pos: Vector2 }) => {
    const { scene } = useScene();
    const scene_canvas = useSceneCanvas();

    const path = createMemo(() => {
        if (props.start_slot == null) {
            return;
        }
        const start = scene_canvas.elementController.get_slot_position(props.start_slot);
        
        const start_anchor = props.start_slot.anchor;
        
        let end = props.cursor_pos;
        let end_anchor = start_anchor;

        if (props.hovered_slot != null && props.start_slot.canConnectTo(props.hovered_slot, scene.registry)) {
            end = scene_canvas.elementController.get_slot_position(props.hovered_slot);
            end_anchor = props.hovered_slot.anchor;
        }

        return make_simple_curved_path(start, end, start_anchor, end_anchor);
    });

    return (
        <path class="connection-path-preview"
            d={path()}
        />
    );
};

export const ConnectionLines = (props: { connection: SceneConnection, onDisconnect: (connection: SceneConnection) => void }) => {
    const scene = useScene();
    const scene_canvas = useSceneCanvas();

    const pathId = `path-${props.connection.uid}`;
    const path = createMemo(() => {
        
        const start = scene_canvas.elementController.get_slot_position(props.connection.output_slot);
        const end = scene_canvas.elementController.get_slot_position(props.connection.input_slot);
        const anchor_a = props.connection.output_slot.anchor;
        const anchor_b = props.connection.input_slot.anchor;

        return make_simple_curved_path(start, end, anchor_a, anchor_b);
    });

    // TODO: Maybe change this to be a keybind idk or a tool function
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        props.onDisconnect(props.connection);
    };

    // const is_current_step = createMemo(() => {
    //     const parent_node = scene_canvas.nodes[props.connection.input_slot.node_id];
    //     return parent_node.isCurrentStep;
    // });

    return (
        <g 
            class={"connection-group"} 
            classList={{
                "unsynced": !scene.isPending(props.connection.uid),
                // "current-step": is_current_step()
            }}
        >
            <text class="connection-arrow-text" dy="3.5"> 
                <textPath 
                    href={`#${pathId}`} 
                    startOffset="50%" 
                    text-anchor="middle"
                >
                    ▶
                </textPath>
            </text>
            <path class="clickable-path"
                onContextMenu={handleContextMenu}
                d={path()}
            />
            <path class="connection-path"
                d={path()}
                marker-end="url(#arrowhead)"
                id={pathId}
            />
        </g>
    );
};