import { ConnectionSceneData, MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, EditorActionStatus, SceneActionTypes, ServerMessages, WebsocketStatus } from "./websocket-protocol";

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
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: any }
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string, type_data: any}
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; message: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: {loop_state: any, instance_state: any} }
    | { type: ServerMessages.SYNC_ACTION; action_statuses: { [uid: string]: EditorActionStatus; }};
    

export type ClientMessage = ClientCommand | ClientAction;

export type ClientCommand = 
    | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
    | { type: ClientMessages.LOAD_SCENE; payload: any }
    | { type: ClientMessages.SYNC_CLIENT_SCENE }
    | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
    | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } };
    
export type ClientAction = 
    | { type: ClientMessages.NODE_ACTION, payload: NodeActionPayload, action_uid: string }
    | { type: ClientMessages.CONNECTION_ACTION, payload: ConnectionActionPayload, action_uid: string }
