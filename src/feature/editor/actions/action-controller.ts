import { ClientCommand } from "~/protocols/nodeblocks/network/message/client-commands";
import { EditorActionStatus, ServerMessageTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { NodeScene } from "../engine/node_scene";
import { SceneConnectionManager } from "../network/scene-connection-manager";
import { Action } from "./action";
import { CmdStatusPack, CommandStatus } from "~/protocols/nodeblocks/network/message/server/server-event-protocol";

export class ActionController {
    private _pendingActions: Map<string, Action> = new Map();
    private _actionHistory: Action[] = [];
    private readonly maxHistory: number = 20; // TODO: add a config for this

    constructor(
        private scene: NodeScene,
        private sceneClient: SceneConnectionManager
    ) {
        this.sceneClient.onMessage(ServerMessageTypes.COMMAND_RESPONSE, 
            (msg) => {
                this.handleServerSync(msg.cmd_uid, msg.response_payload.status);
            }
        );
    }

    public dispatch<T extends ClientCommand>(action: Action<T>): void {
        action.apply(this.scene);

        if (action.isClientside || !this.sceneClient.isConnected()) {
            action.setStatus(EditorActionStatus.SUCCESSFUL);
            this.recordHistory(action);
            return;
        }

        this._pendingActions.set(action.uid, action);
        this.recordHistory(action);

        const command: ClientCommand = action.toServerMessage();
        this.sceneClient.sendCommand(command);
    }

    private handleServerSync(cmd_uid: string, status: CmdStatusPack): void {
        const action = this._pendingActions.get(cmd_uid);
        if (!action) {
            return;
        }

        action.setStatus(status.status as unknown as EditorActionStatus);
        if (status.status === CommandStatus.FAILED) {
            console.warn(`[ActionController] Command ${cmd_uid} failed on server. Reverting...`);
            action.revert(this.scene);
            action.setStatus(EditorActionStatus.REVERTED);
        }

        this._pendingActions.delete(cmd_uid);
    }

    private recordHistory(action: Action): void {
        this._actionHistory.push(action);

        if (this._actionHistory.length > this.maxHistory) {
            this._actionHistory.shift();
        }
    }
}