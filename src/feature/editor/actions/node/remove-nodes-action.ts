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
            scene.addNode(node);
        }

        for (const conn of this._backupConnections) {
            scene.addConnection(conn);
        }

        this._backupNodes = [];
        this._backupConnections = [];
    }

    public partialRevert(scene: NodeScene, failedTargetIds: Set<string>): void {
        const remainingBackupNodes: NodeInstance[] = [];
        for (const node of this._backupNodes) {
            if (failedTargetIds.has(node.uid)) {
                scene.addNode(node);
                this._targetIds.delete(node.uid);
                continue;
            } 
            remainingBackupNodes.push(node);
        }
        this._backupNodes = remainingBackupNodes;
        this.nodeUids = this.nodeUids.filter((uid) => !failedTargetIds.has(uid));

        const remainingBackupConns: ConnectionSceneData[] = [];
        for (const conn of this._backupConnections) {
            const involvesFailedNode =
                failedTargetIds.has(conn.from_slot.node_id) ||
                failedTargetIds.has(conn.to_slot.node_id);

            const bothNodesExist =
                Boolean(scene.graph.getNode(conn.from_slot.node_id)) &&
                Boolean(scene.graph.getNode(conn.to_slot.node_id));

            if (involvesFailedNode && bothNodesExist) {
                scene.addConnection(conn);
                continue;
            } 
            remainingBackupConns.push(conn);
        }
        this._backupConnections = remainingBackupConns;
    }
}