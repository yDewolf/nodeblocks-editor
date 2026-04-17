import { Action, ActionController, PayloadTypes } from "~/network/controllers/action-controller";
import { NodeActionPayload, ConnectionActionPayload, dNodeActionPayload } from "~/network/websocket/request-types";
import { ClientMessages, EditorActionStatus, SceneActionTypes } from "~/network/websocket/websocket-protocol";


export interface SyncAbleElement<ActionPayloadType extends PayloadTypes> {
    related_actions: Action<ActionPayloadType>[];

    append_add_action(action: Action<ActionPayloadType>): boolean;
    append_remove_action(action: Action<ActionPayloadType>): boolean;
    append_update_action(action: Action<ActionPayloadType>): boolean;

    is_synced(): boolean;
}

export abstract class SceneElement<ActionPayloadType extends PayloadTypes> implements SyncAbleElement<ActionPayloadType> {
    related_actions: Action<ActionPayloadType>[];

    constructor() {
        this.related_actions = new Array();
    }

    append_add_action(action: Action<ActionPayloadType>): boolean {
        throw new Error("Method not implemented.");
    }
    append_remove_action(action: Action<ActionPayloadType>): boolean {
        throw new Error("Method not implemented.");
    }
    append_update_action(action: Action<ActionPayloadType>): boolean {
        throw new Error("Method not implemented.");
    }


    public is_synced(): boolean {
        return this.related_actions.some((action) => {
            action.status == EditorActionStatus.UNSYNCED;
        });
    }
}

export abstract class BaseNode extends SceneElement<NodeActionPayload> {
    append_add_action(action: Action<NodeActionPayload>): boolean {
        if (action.request.payload.action != SceneActionTypes.ADD) return false;
     
        this.related_actions.push(action);
        return true
    }
    append_remove_action(action: Action<NodeActionPayload>): boolean {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return false;
     
        this.related_actions.push(action);
        return true
    }
    append_update_action(action: Action<NodeActionPayload>): boolean {
        if (action.request.payload.action != SceneActionTypes.UPDATE) return false;
        
        this.related_actions.push(action);
        return true
    }
}