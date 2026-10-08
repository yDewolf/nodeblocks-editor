import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { NodeGraphCommand, NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";

export class UpdateNodesAction extends Action<NodeGraphCommand> {
    private _backupData: NodeSceneRequestData = {};

    constructor(
        private updateData: NodeSceneRequestData,
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(Object.keys(updateData));
    }

    public toServerMessage(): NodeGraphCommand {
        return {
            cmd_uid: this.uid,
            cmd_group: CommandGroups.GRAPH,
            type: ClientGraphCommandTypes.NODE,
            payload: {
                action: GraphActionTypes.UPDATE,
                action_data: this.updateData,
            },
        };
    }

    public apply(scene: NodeScene): void {
        this._backupData = {};

        for (const [uid, newData] of Object.entries(this.updateData)) {
            const node = scene.graph.getNode(uid);
            if (node) {
                this._backupData[uid] = node.scene_data;

                if (newData.position) node.scene_data.position = newData.position;
                if (newData.data) node.scene_data.data = newData.data;
            }
        }
    }

    public revert(scene: NodeScene): void {
        for (const [uid, previousData] of Object.entries(this._backupData)) {
            const node = scene.graph.getNode(uid);
            if (node) {
                node.scene_data = previousData;
            }
        }
        this._backupData = {};
    }
}