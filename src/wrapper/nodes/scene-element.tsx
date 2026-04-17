import { createMemo, createSignal } from "solid-js";
import { Action, ActionController, PayloadTypes } from "~/network/controllers/action-controller";
import { NodeActionPayload, ConnectionActionPayload, dNodeActionPayload } from "~/network/websocket/request-types";
import { ClientMessages, EditorActionStatus, SceneActionTypes } from "~/network/websocket/websocket-protocol";


export interface SyncAbleElement<ActionPayloadType extends PayloadTypes> {
    _related_actions: () => Action<ActionPayloadType>[];
    _set_related_actions: (value: any) => void;

    _ready_to_free: () => boolean;
    _set_ready_to_free: (value: boolean) => void;

    append_add_action(action: Action<ActionPayloadType>): boolean;
    append_remove_action(action: Action<ActionPayloadType>): boolean;
    append_update_action(action: Action<ActionPayloadType>): boolean;

    is_synced(): boolean;
}

export abstract class SceneElement<ActionPayloadType extends PayloadTypes> implements SyncAbleElement<ActionPayloadType> {
    _related_actions: () => Action<ActionPayloadType>[];
    _set_related_actions: (value: any) => void;

    _ready_to_free: () => boolean;
    _set_ready_to_free: (value: boolean) => void;

    constructor() {
        const [readyToFree, setReadyToFree] = createSignal(false);
        this._ready_to_free = readyToFree;
        this._set_ready_to_free = setReadyToFree;
        const [relatedActions, setRelatedActions] = createSignal([]);
        this._related_actions = relatedActions;
        this._set_related_actions = setRelatedActions;

        // FIXME
        // const ready_to_free = createMemo(() => {
        //     this._set_ready_to_free(this.is_synced());
        // });
    }

    get related_actions() { return this._related_actions() }
    set related_actions(value: Action<ActionPayloadType>[]) { this._set_related_actions(value) }

    append_add_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.ADD) return false;
     
        this.related_actions.push(action);
        return true
    }
    append_remove_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return false;
     
        this.related_actions.push(action);
        return true
    }
    append_update_action(action: Action<ActionPayloadType>): boolean {
        if (action.request.payload.action != SceneActionTypes.UPDATE) return false;
        
        this.related_actions.push(action);
        return true
    }

    public is_synced(): boolean {
        if (this.related_actions.length == 0) { return true; }
        return this.related_actions.some((action) => {
            action.status == EditorActionStatus.UNSYNCED;
        });
    }
}

export abstract class BaseNode extends SceneElement<NodeActionPayload> {

}

export abstract class BaseConnection extends SceneElement<ConnectionActionPayload> {

}