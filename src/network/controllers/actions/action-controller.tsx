import { NodeServerClient } from "../../websocket/websocket-handler";
import { ClientMessages, EditorActionStatus, SceneActionTypes, ServerMessages } from "../../websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ClientAction, ConnectionActionPayload, NodeActionPayload, NodeSceneRequestData } from '../../websocket/request-types';
import { nanoid } from "nanoid";
import { createSignal } from "solid-js";
import { NodeEditor } from "~/editor/node-editor";
import { NodeConnection } from "~/wrapper/nodes/node-connection";

export type PayloadTypes = NodeActionPayload | ConnectionActionPayload;
export class Action<PayloadType extends PayloadTypes> {
    private _request: ClientAction;
    private _status: () => EditorActionStatus;
    private _set_status: (new_status: EditorActionStatus) => void;

    constructor(
        request: ClientAction, 
        private _unsynced_apply: (action: Action<PayloadType>) => void, 
        private _unsynced_revert: (action: Action<PayloadType>) => void,
        private _finish_sync: (action: Action<PayloadType>) => void
    ) {
        const [status, setStatus] = createSignal(EditorActionStatus.UNSYNCED);
        this._status = status;
        this._set_status = setStatus;
        this._request = request
    }
    
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

    protected unsynced_actions: Array<Action<any>> = new Array();

    constructor(client: NodeServerClient, editor: NodeEditor) {
        this._client = client
        this._editor = editor;

        this._client.add_handler(ServerMessages.SYNC_ACTION, (message) => {
            this.sync_actions(message.action_statuses);
        });
    }

    // Called when client receives server's SYNC_ACTION packet
    protected sync_actions(action_statuses: { [uid: string]: EditorActionStatus; }) {
        Object.entries(action_statuses).forEach(([uid, status]) => {
            const unsynced_action = this.unsynced_actions.filter((action) => action.uid == uid).at(0);
            if (unsynced_action) {
                unsynced_action.update_action_status(status);
            }
        })
    }

    public add_new_action(action: Action<any>) {
        this.unsynced_actions.push(action);
        this.action_history.push(action);

        if (this.action_history.length > this.MAX_ACTION_HISTORY) {
            this.action_history.shift();
        }
    }
}
