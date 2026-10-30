import { ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { ConnGraphCommand } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";

export class RemoveConnectionsAction extends Action<ConnGraphCommand> {
    private _backupConnections: ConnectionSceneData[] = [];

    constructor(
        private connectionUids: string[],
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(connectionUids);
    }

    public toServerMessage(): ConnGraphCommand {
        return {
            cmd_uid: this.uid,
            cmd_group: CommandGroups.GRAPH,
            type: ClientGraphCommandTypes.CONN,
            payload: {
                action: GraphActionTypes.REMOVE,
                uids: this.connectionUids,
            },
        };
    }

    public apply(scene: NodeScene): void {
        this._backupConnections = [];

        for (const uid of this.connectionUids) {
            const conn = scene.graph.getConnection(uid);
            if (conn) {
                this._backupConnections.push(conn);
                scene.removeConnection(uid);
            }
        }
    }

    public revert(scene: NodeScene): void {
        for (const conn of this._backupConnections) {
            scene.addConnection(conn);
        }
        this._backupConnections = [];
    }
}