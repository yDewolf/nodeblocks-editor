import { ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { NodeGraphCommand } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { NodeInstance } from "../../engine/graph/node-instance";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";

export class RemoveNodesAction extends Action<NodeGraphCommand> {
    private _backupNodes: NodeInstance[] = [];
    private _backupConnections: ConnectionSceneData[] = [];

    constructor(
        private nodeUids: string[],
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(nodeUids);
    }

    public toServerMessage(): NodeGraphCommand {
        return {
            cmd_uid: this.uid,
            cmd_group: CommandGroups.GRAPH,
            type: ClientGraphCommandTypes.NODE,
            payload: {
                action: GraphActionTypes.REMOVE,
                uids: this.nodeUids,
            },
        };
    }

    public apply(scene: NodeScene): void {
        this._backupNodes = [];
        this._backupConnections = [];

        for (const uid of this.nodeUids) {
            const node = scene.graph.getNode(uid);
            if (node) {
                this._backupNodes.push(node);
                const attachedConns = scene.graph.getNodeConnections(uid);
                this._backupConnections.push(...attachedConns);

                scene.removeNode(uid);
            }
        }
    }

    public revert(scene: NodeScene): void {
        for (const node of this._backupNodes) {
            scene.graph.addNode(node);
        }

        for (const conn of this._backupConnections) {
            scene.graph.addConnection(conn);
        }

        this._backupNodes = [];
        this._backupConnections = [];
    }
}