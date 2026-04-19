import { NodeServerClient } from "../../websocket/websocket-handler";
import { ClientMessages, EditorActionStatus, SceneActionTypes, ServerMessages } from "../../websocket/websocket-protocol";
import { ClientAction, ConnectionActionPayload, NodeActionPayload, NodeSceneRequestData } from '../../websocket/request-types';
import { nanoid } from "nanoid";
import { createSignal } from "solid-js";
import { NodeEditor } from "~/editor/node-editor";

export type PayloadTypes = NodeActionPayload | ConnectionActionPayload;
export class Action<PayloadType extends PayloadTypes> {
    private clientside: boolean = false;
    private _request: ClientAction;
    private _status: () => EditorActionStatus;
    private _set_status: (new_status: EditorActionStatus) => void;

    constructor(
        clientside: boolean,
        request: ClientAction, 
        private _unsynced_apply: (action: Action<PayloadType>) => void, 
        private _unsynced_revert: (action: Action<PayloadType>) => void,
        private _finish_sync: (action: Action<PayloadType>) => void
    ) {
        this.clientside = clientside;
        const [status, setStatus] = createSignal(EditorActionStatus.UNSYNCED);
        this._status = status;
        this._set_status = setStatus;
        this._request = request
    }
    
    get is_clientside() { return this.clientside; }

    // Applies client only stuff
    public unsynced_apply() {
        this._unsynced_apply(this);
    }

    // Syncs with server's result
    private finish_sync() {
        this._finish_sync(this);
    }

    public unsynced_revert() {
        this._unsynced_revert(this);
    }

    private revert() {
        this._unsynced_revert(this);
    }

    public update_action_status(new_status: EditorActionStatus) {
        this._set_status(new_status);
        this.finish_sync();
    }

    get status() {return this._status(); }

    get uid() {return this._request.action_uid}
    get request() {return this._request}

    public static make_action_id(action_type: SceneActionTypes): string {
        return action_type + "_" + nanoid(6);
    }
}

export class ActionController {
    _client: NodeServerClient;
    _editor: NodeEditor;

    private MAX_ACTION_HISTORY: number = 10;
    private action_history: Array<Action<any>> = new Array(); 

    protected _unsynced_actions: () => Array<Action<any>>;
    protected _set_unsynced_actions: (value: Array<Action<any>>) => void;

    constructor(client: NodeServerClient, editor: NodeEditor) {
        this._client = client
        this._editor = editor;
        const [unsyncedActions, setUnsyncedActions] = createSignal([]);
        this._unsynced_actions = unsyncedActions;
        this._set_unsynced_actions = setUnsyncedActions;

        this._client.add_handler(ServerMessages.SYNC_ACTION, (message) => {
            this.sync_actions(message.action_statuses);
        });
    }

    get unsynced_actions() { return this._unsynced_actions(); }
    set unsynced_actions(value: Array<Action<any>>) { this._set_unsynced_actions(value); }

    // Called when client receives server's SYNC_ACTION packet
    protected sync_actions = (action_statuses: { [uid: string]: EditorActionStatus; }) => {
        let synced_actions: Array<Action<any>> = [];
        Object.entries(action_statuses).forEach(([uid, status]) => {
            const unsynced_action = this.unsynced_actions.filter((action) => action.uid == uid).at(0);
            if (unsynced_action) {
                unsynced_action.update_action_status(status);
                synced_actions.push(unsynced_action);
            }
        });
        this.unsynced_actions = this.unsynced_actions.filter((action) => synced_actions.includes(action));
    }

    public add_new_action(action: Action<any>) {
        this.action_history.push(action);
        if (this.action_history.length > this.MAX_ACTION_HISTORY) {
            this.action_history.shift();
        }
        
        if (!action.is_clientside) {
            this.unsynced_actions = [...this.unsynced_actions, action];
            this._client.sendCommand(action.request);
        }
    }
}