import { createMemo, createRoot, createSignal } from "solid-js";
import { Action,PayloadTypes } from "~/network/controllers/actions/action-controller";
import { NodeActionPayload, ConnectionActionPayload } from "~/network/websocket/request-types";
import { EditorActionStatus, SceneActionTypes } from "~/network/websocket/websocket-protocol";


export interface SyncAbleElement<ActionPayloadType extends PayloadTypes> {
    _related_actions: () => Action<ActionPayloadType>[];
    _set_related_actions: (value: any) => void;

    append_add_action(action: Action<ActionPayloadType>): boolean;
    append_remove_action(action: Action<ActionPayloadType>): boolean;
    append_update_action(action: Action<ActionPayloadType>): boolean;

    _is_synced: (() => boolean) | undefined;

    free(): void;
    // _is_synced: () => boolean;
}

export abstract class SceneElement<ActionPayloadType extends PayloadTypes> implements SyncAbleElement<ActionPayloadType> {
    _related_actions: () => Action<ActionPayloadType>[];
    _set_related_actions: (value: any) => void;
    _is_synced: (() => boolean) | undefined = undefined;
    _disposable: (() => void) | undefined = undefined; 
    // _is_synced: () => boolean;
    // _set_is_synced: (value: boolean) => void;
    get is_synced() {return this._is_synced!() ?? false; }

    constructor() {
        const [relatedActions, setRelatedActions] = createSignal([]);
        this._related_actions = relatedActions;
        this._set_related_actions = setRelatedActions;

        // const [is_synced, setIsSynced] = createSignal(false);
        // this._is_synced = is_synced;
        // this._set_is_synced = setIsSynced;
        
        createRoot((dispose) => {
            this._is_synced = createMemo(() => {
                if (this.related_actions.length == 0) return false;
                
                const is_synced = !this.related_actions.some(
                    (action) => action.status === EditorActionStatus.UNSYNCED
                );
                return is_synced;
            });
            this._disposable = dispose;
        });
    }

    free(): void {
        if (this._disposable) {
            this._disposable();
        }
    }

    get related_actions() { return this._related_actions() }
    set related_actions(value: Action<ActionPayloadType>[]) { this._set_related_actions(value) }

    append_add_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.ADD) return false;
     
        this.related_actions = [...this.related_actions, action];
        return true
    }
    append_remove_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return false;
     
        this.related_actions = [...this.related_actions, action];
        return true
    }
    append_update_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.UPDATE) return false;
        
        this.related_actions = [...this.related_actions, action];
        return true
    }
}

export abstract class BaseNode extends SceneElement<NodeActionPayload> {

}

export abstract class BaseConnection extends SceneElement<ConnectionActionPayload> {
    _related_node_actions: () => Action<NodeActionPayload>[];
    _set_related_node_actions: (value: Action<NodeActionPayload>[]) => void;
    
    constructor() {
        super();
        const [relatedNodeActions, setrelatedNodeActions] = createSignal([]);
        this._related_node_actions = relatedNodeActions;
        this._set_related_node_actions = setrelatedNodeActions;

        createRoot((dispose) => {
            this._is_synced = createMemo(() => {
                if (this.related_actions.length == 0) return false;
    
                const actionsSynced = !this.related_actions.some(action => action.status === EditorActionStatus.UNSYNCED);
                const nodeActionsSynced = !this.related_node_actions.some(action => action.status === EditorActionStatus.UNSYNCED);
                
                return actionsSynced && nodeActionsSynced;
            });
            this._disposable = dispose;
        })
    }

    public append_node_remove_action(action: Action<NodeActionPayload>) {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return false;
     
        this.related_node_actions = [...this.related_node_actions, action];
        return true
    }

    get related_node_actions() { return this._related_node_actions() }
    set related_node_actions(value) { this._set_related_node_actions(value)}
}