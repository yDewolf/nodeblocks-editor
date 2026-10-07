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

        if (nodeSceneData.uid === undefined) {
            nodeSceneData.uid = nanoid();
        }

        const slots = this._createSlotsFromSpec(spec, nodeSceneData.uid);
        return new NodeInstance(nodeSceneData, slots);
    }

    protected _createSlotsFromSpec(spec: NodeTypeSpec, nodeUid: string): Record<string, SlotInstance> {
        const slots: Record<string, SlotInstance> = {};

        // Iteração limpa sobre [slotId, slotSpec] de spec.slots
        for (const [slotId, slotSpec] of Object.entries(spec.slots)) {
            slots[slotId] = new SlotInstance(nodeUid, slotId, slotSpec);
        }

        return slots;
    }
}