import { CommandGroups, ClientGraphCommandTypes, GraphActionTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { NodeGraphCommand, NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { Action } from "../action";
import { NodeScene } from "../../engine/node_scene";

export class UpdateNodesAction extends Action<NodeGraphCommand> {
    private _backupData: NodeSceneRequestData = {};

    constructor(
        private updateData: NodeSceneRequestData,
        private initialData?: NodeSceneRequestData,
        isClientside: boolean = false
    ) {
        super(isClientside);
        this._targetIds = new Set(Object.keys(updateData));
        if (initialData) {
            this._backupData = structuredClone(initialData);
        }
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
        if (!this.initialData && Object.keys(this._backupData).length === 0) {
            for (const uid of Object.keys(this.updateData)) {
                const node = scene.graph.getNode(uid);
                if (node) {
                    this._backupData[uid] = structuredClone(node.scene_data);
                }
            }
        }

        for (const [uid, newData] of Object.entries(this.updateData)) {
            const node = scene.graph.getNode(uid);
            if (node) {
                node.updateSceneData(newData.data, newData.position);
            }
        }
    }

    public revert(scene: NodeScene): void {
        for (const [uid, previousData] of Object.entries(this._backupData)) {
            const node = scene.graph.getNode(uid);
            if (node) {
                node.updateSceneData(previousData.data, previousData.position, true);
            }
        }
        this._backupData = {};
    }
}