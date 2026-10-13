import { SceneConnection } from "../objects/scene-connection";
import { SceneNode } from "../objects/scene-node";
import { SceneNodeSlot } from "../objects/scene-slot";

export class CanvasElementController {
    constructor(
        private readonly nodes: Record<string, SceneNode>,
        private readonly conns: Record<string, SceneConnection>
    ) {

    }

    public get_slot_position = (slot: SceneNodeSlot) => {
        const parent_node = this.nodes[slot.node_id];
        parent_node.size;

        if (!slot._element) {
            const world_pos = {
                x: parent_node.position.x + (slot.isInput == false ? parent_node.size.x : 0),
                y: parent_node.position.y + (parent_node.size.y / 2)
            };
            slot.worldPos = world_pos;
            return world_pos;
        }

        const world_pos = {
            x: parent_node.position.x + slot._element.offsetLeft + slot._element.offsetWidth / 2,
            y: parent_node.position.y + slot._element.offsetTop + slot._element.offsetHeight / 2
        }; 

        slot.worldPos = world_pos;
        return world_pos; 
    }
}