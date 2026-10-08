import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { ConnGraphCommand, ConnSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";

export class AddConnectionsAction extends Action<ConnGraphCommand> {
    constructor(
        private connsData: ConnSceneRequestData,
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(Object.keys(connsData));
    }

    public toServerMessage(): ConnGraphCommand {
        return {
            cmd_uid: this.uid,
            cmd_group: CommandGroups.GRAPH,
            type: ClientGraphCommandTypes.CONN,
            payload: {
                action: GraphActionTypes.ADD,
                action_data: this.connsData,
            },
        };
    }

    public apply(scene: NodeScene): void {
        for (const connData of Object.values(this.connsData)) {
            scene.graph.addConnection(connData);
        }
    }

    public revert(scene: NodeScene): void {
        for (const connData of Object.values(this.connsData)) {
            scene.graph.disconnect(connData.uid);
        }
    }
}