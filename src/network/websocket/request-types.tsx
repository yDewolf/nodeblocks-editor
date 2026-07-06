import { ConnectionSceneData, MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, EditorActionStatus, SceneActionTypes, ServerMessages, WebsocketStatus } from "./websocket-protocol";
import { ServerNotification, NotificationWithMeta } from './requests/notifications';
import { TypeFile } from "~/wrapper/helpers/node-type-file";
import { Metadata, MetadataVersion } from "~/wrapper/metadata/header_metadata";

// First message client sends after connecting
export type ClientVersionSync = {
    types_id: string | undefined,
    types_version: number | undefined,
    meta_version: number | undefined
}

// Response for ClientVersionSync
export type ServerVersionSync = {
    types?: TypeFile,
    metadata?: Metadata // TODO: implement metadata stuff
}


export type NodeSceneRequestData = {[uid: string]: MinimalNodeSceneData};
export type ConnSceneRequestData = {[uid: string]: ConnectionSceneData};

export type NodeActionPayload = 
    | {action: SceneActionTypes.ADD, action_data: NodeSceneRequestData}
    | {action: SceneActionTypes.REMOVE, uids: string[]}
    | {action: SceneActionTypes.UPDATE, action_data: NodeSceneRequestData}

export type ConnectionActionPayload = 
    | {action: SceneActionTypes.ADD, action_data: ConnSceneRequestData}
    | {action: SceneActionTypes.REMOVE, uids: string[]}
    | {action: SceneActionTypes.UPDATE, action_data: ConnSceneRequestData}

    
export type ServerMessage = 
    | (ServerVersionSync & { type: ServerMessages.SYNC_VERSIONS })
    | { type: ServerMessages.METADATA_UPDATED; metadata_version: MetadataVersion}
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: any }
    // FIXME: handshake_sync is not fully type safe
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string}
    // | { type: ServerMessages.HANDSHAKE_SYNC; status: number; message: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: {loop_state: any, instance_state: any} }
    | { type: ServerMessages.SYNC_ACTION; action_statuses: { [uid: string]: EditorActionStatus; }}
    | { type: ServerMessages.SYNC_FILES;}
    | { type: ServerMessages.SYNC_NOTIFICATIONS; notifications: ServerNotification[]}
    | { type: ServerMessages.CLOSE_SOCKET}
    | ServerNotification
    

export type ClientMessage = ClientCommand | ClientAction;

export type ClientCommand = 
    | (ClientVersionSync & { type: ClientMessages.SYNC_VERSIONS })
    | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
    | { type: ClientMessages.LOAD_SCENE; payload: any }
    | { type: ClientMessages.SYNC_CLIENT_SCENE }
    | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
    | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } }
    | { type: ClientMessages.UPDATE_NOTIFICATION; payload: NotificationWithMeta }
    | { type: ClientMessages.SYNC_NOTIFICATIONS};
    
export type ClientAction = 
    | { type: ClientMessages.NODE_ACTION, payload: NodeActionPayload, action_uid: string }
    | { type: ClientMessages.CONNECTION_ACTION, payload: ConnectionActionPayload, action_uid: string }
