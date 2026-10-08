import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { NodeGraphCommand, NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { NodeInstance, SlotInstance } from "../../engine/graph/node-instance";
import { TypeSpecRegistry } from "../../engine/type-registry";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";


export class AddNodesAction extends Action<NodeGraphCommand> {
    private _createdInstances: NodeInstance[] = [];

    constructor(
        private nodesData: NodeSceneRequestData,
        private registry: TypeSpecRegistry,
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(Object.keys(this.nodesData));
    }

    public toServerMessage(): NodeGraphCommand {
        return {
            cmd_uid: this.uid,
            cmd_group: CommandGroups.GRAPH,
            type: ClientGraphCommandTypes.NODE,
            payload: {
                action: GraphActionTypes.ADD,
                action_data: this.nodesData,
            },
        };
    }

    public apply(scene: NodeScene): void {
        this._createdInstances = [];

        for (const [uid, sceneData] of Object.entries(this.nodesData)) {
            if (sceneData.uid in scene.graph.allNodes) {
                continue;
            }
            const instance = scene.createNodeFromData(sceneData.nodetype_fqn, sceneData);
            this._createdInstances.push(instance);
        }
    }

    public revert(scene: NodeScene): void {
        for (const instance of this._createdInstances) {
            scene.removeNode(instance.uid);
        }
        this._createdInstances = [];
    }
}