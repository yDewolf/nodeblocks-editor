import { ConnectionSceneData, MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, EditorActionStatus, SceneActionTypes, ServerMessages, WebsocketStatus } from "./websocket-protocol";

export type NodeSceneRequestData = {[uid: string]: MinimalNodeSceneData};

export type NodeActionPayload = 
    | {action: SceneActionTypes.ADD, action_data: NodeSceneRequestData}
    | {action: SceneActionTypes.REMOVE, uids: string[]}
    | {action: SceneActionTypes.UPDATE, action_data: NodeSceneRequestData}

export type ConnectionActionPayload = 
    | {action: SceneActionTypes.ADD, action_data: { [uid: string]: ConnectionSceneData; }}
    | {action: SceneActionTypes.REMOVE, uids: string[]}
    | {action: SceneActionTypes.UPDATE, action_data: { [uid: string]: ConnectionSceneData; }}

export type ClientAction = 
    | { action_uid: string, type: ClientMessages.NODE_ACTION, payload: NodeActionPayload }
    | { action_uid: string, type: ClientMessages.CONNECTION_ACTION, payload: ConnectionActionPayload }


// @DEPRECATED
export type dNodeActionPayload = 
    | {action: SceneActionTypes.ADD, uid: string, action_data: MinimalNodeSceneData}
    | {action: SceneActionTypes.REMOVE, uid: string}
    | {action: SceneActionTypes.UPDATE, uid: string, action_data: MinimalNodeSceneData}

// @DEPRECATED
export type dConnectionActionPayload =
    | {action: SceneActionTypes.ADD, uid: string, action_data: ConnectionSceneData}
    | {action: SceneActionTypes.REMOVE, uid: string}
    | {action: SceneActionTypes.UPDATE, uid: string, action_data: ConnectionSceneData}


export type ServerMessage = 
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: any }
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string, type_data: any}
    | { type: ServerMessages.HANDSHAKE_SYNC; message: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: {loop_state: any, instance_state: any} }
    | { type: ServerMessages.SYNC_ACTION; action_statuses: { [uid: string]: EditorActionStatus; }};


export type ClientCommand = 
    | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
    // @DEPRECATED
    | { type: ClientMessages.NODE_ACTION, payload: dNodeActionPayload }
    // @DEPRECATED
    | { type: ClientMessages.CONNECTION_ACTION, payload: dConnectionActionPayload }
    
    | { type: ClientMessages.LOAD_SCENE; payload: any }
    | { type: ClientMessages.SYNC_CLIENT_SCENE }
    | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
    | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } };
