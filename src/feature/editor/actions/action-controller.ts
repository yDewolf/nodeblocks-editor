import { ClientCommand } from "~/protocols/nodeblocks/network/message/client-commands";
import { EditorActionStatus, ServerMessageTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { NodeScene } from "../engine/node_scene";
import { SceneConnectionManager } from "../network/scene-connection-manager";
import { Action } from "./action";
import { CmdStatusPack, CommandStatus } from "~/protocols/nodeblocks/network/message/server/server-event-protocol";

type PendingChangeListener = (targetIds: Set<string>) => void;
export class ActionController {
    private _pendingActions: Map<string, Action> = new Map();
    // target uid -> related action uids
    private _target_actions_map: Map<string, Set<string>> = new Map();
    private _listeners: Set<PendingChangeListener> = new Set();

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


    public subscribePending(listener: PendingChangeListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    private notifyPending(targetIds: Set<string>): void {
        this._listeners.forEach((listener) => listener(targetIds));
    }

    public isEntityPending(targetId: string): boolean {
        const actionSet = this._target_actions_map.get(targetId);
        return Boolean(actionSet && actionSet.size > 0);
    }


    public dispatch<T extends ClientCommand>(action: Action<T>): void {
        action.apply(this.scene);
        if (action.isClientside || !this.sceneClient.isConnected()) {
            action.setStatus(EditorActionStatus.SUCCESSFUL);
            this.recordHistory(action);
            return;
        }

        this._pendingActions.set(action.uid, action);
        this.updateActionTargetSets(action);
        this.recordHistory(action);

        const command: ClientCommand = action.toServerMessage();
        this.sceneClient.sendCommand(command);
    }

    private handleServerSync(cmd_uid: string, status: CmdStatusPack): void {
        const action = this._pendingActions.get(cmd_uid);
        if (!action) return;

        action.setStatus(status.status as unknown as EditorActionStatus);
        
        if (status.status === CommandStatus.FAILED) {
            console.warn(`[ActionController] Command ${cmd_uid} failed on server. Reverting...`);
            action.revert(this.scene);
            action.setStatus(EditorActionStatus.REVERTED);
        }

        this._pendingActions.delete(cmd_uid);
        this.removeActionFromTargetSets(action);
    }

    private updateActionTargetSets(action: Action) {
        for (const target of action.targetIds) {
            let action_set = this._target_actions_map.get(target);
            if (!action_set) {
                action_set = new Set();
                this._target_actions_map.set(target, action_set);
            }
            action_set.add(action.uid);
        }
        this.notifyPending(action.targetIds);
    }

    private removeActionFromTargetSets(action: Action) {
        for (const target of action.targetIds) {
            const action_set = this._target_actions_map.get(target);
            if (action_set) {
                action_set.delete(action.uid);
                if (action_set.size === 0) {
                    this._target_actions_map.delete(target);
                }
            }
        }
        this.notifyPending(action.targetIds);
    }

    private recordHistory(action: Action): void {
        this._actionHistory.push(action);
        if (this._actionHistory.length > this.maxHistory) {
            this._actionHistory.shift();
        }
    }
}