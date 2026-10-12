import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { TypeSpecRegistry } from "../type-registry";
import { NodeInstance, SlotInstance } from "../graph/node-instance";
import { nanoid } from "nanoid";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";

export class NodeInstanceFactory {
    registry: TypeSpecRegistry

    constructor(registry: TypeSpecRegistry) {
        this.registry = registry;
    }

    public createNew(node_fqn: string, position: Vector2): NodeInstance {
        return this.create(node_fqn, {
            uid: nanoid(),
            nodetype_fqn: node_fqn,
            position: position,
            data: {}
        })
    }

    public create(nodeFqn: string, nodeSceneData: NodeSceneData): NodeInstance {
        const spec = this.registry.getNodeTypeSpec(nodeFqn);

        if (Object.keys(nodeSceneData.data).length === 0) {
            for (const [key, paramSpec] of Object.entries(spec.parameters)) {
                if (paramSpec.default !== undefined) {
                    nodeSceneData.data[key] = paramSpec.default;
                }
            }
        }
        return NodeInstanceFactory.fromSpec(spec, nodeSceneData.uid, nodeSceneData);
    }

    static fromSpec(spec: NodeTypeSpec, uid?: string, nodeSceneData?: NodeSceneData): NodeInstance {
        const node_id = uid ?? nanoid();
        const scene_data = nodeSceneData ?? {
            uid: node_id, nodetype_fqn: spec.fqn, 
            position: {x: 0, y: 0}, data: {}
        };
        scene_data.uid = node_id;
        
        const slots = NodeInstanceFactory._createSlotsFromSpec(spec, node_id);
        return new NodeInstance(
            scene_data, slots
        );
    }

    static _createSlotsFromSpec(spec: NodeTypeSpec, nodeUid: string): Record<string, SlotInstance> {
        const slots: Record<string, SlotInstance> = {};

        // Iteração limpa sobre [slotId, slotSpec] de spec.slots
        for (const [slotId, slotSpec] of Object.entries(spec.slots)) {
            slots[slotId] = new SlotInstance(nodeUid, slotId, slotSpec);
        }

        return slots;
    }
}