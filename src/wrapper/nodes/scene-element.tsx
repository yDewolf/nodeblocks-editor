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

    _is_synced: () => boolean;
}

export abstract class SceneElement<ActionPayloadType extends PayloadTypes> implements SyncAbleElement<ActionPayloadType> {
    _related_actions: () => Action<ActionPayloadType>[];
    _set_related_actions: (value: any) => void;

    _is_synced: () => boolean;
    _set_is_synced: (value: boolean) => void;

    constructor() {
        const [relatedActions, setRelatedActions] = createSignal([]);
        this._related_actions = relatedActions;
        this._set_related_actions = setRelatedActions;

        const [is_synced, setIsSynced] = createSignal(false);
        this._is_synced = is_synced;
        this._set_is_synced = setIsSynced;

        // createRoot(() => {
        //     createMemo(() => {
        //         if (this.related_actions.length == 0) { setIsSynced(true); }
                
        //         const is_synced = this.related_actions.some((action) => {
        //             action.status == EditorActionStatus.UNSYNCED;
        //         });
        //         setIsSynced(is_synced);
        //     });
        // });
        // FIXME
        // const ready_to_free = createMemo(() => {
        //     this._set_ready_to_free(this.is_synced());
        // });
    }

    get is_synced() { return this._is_synced() }

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

    public update_synced() {
        this._set_is_synced(!this.related_actions.some((action) => {
            action.status == EditorActionStatus.UNSYNCED
        }));
    }
}

export abstract class BaseNode extends SceneElement<NodeActionPayload> {

}

export abstract class BaseConnection extends SceneElement<ConnectionActionPayload> {

}