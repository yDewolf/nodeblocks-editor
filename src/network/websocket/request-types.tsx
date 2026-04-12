import { ConnectionSceneData, MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, SceneActions, ServerMessages } from "./websocket-protocol";


export type NodeActionPayload = 
    | {action: SceneActions.ADD, uid: string, action_data: MinimalNodeSceneData}
    | {action: SceneActions.REMOVE, uid: string}
    | {action: SceneActions.UPDATE, uid: string, action_data: MinimalNodeSceneData}

export type ConnectionActionPayload =
    | {action: SceneActions.ADD, uid: string, action_data: ConnectionSceneData}
    | {action: SceneActions.REMOVE, uid: string}
    | {action: SceneActions.UPDATE, uid: string, action_data: ConnectionSceneData}


export type ServerMessage = 
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: any }
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string, type_data: any}
    | { type: ServerMessages.HANDSHAKE_SYNC; message: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: {loop_state: any, instance_state: any} };

export type ClientCommand = 
    | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
    | { type: ClientMessages.NODE_ACTION, payload: NodeActionPayload }
    | { type: ClientMessages.CONNECTION_ACTION, payload: ConnectionActionPayload }
    | { type: ClientMessages.LOAD_SCENE; payload: any }
    | { type: ClientMessages.SYNC_CLIENT_SCENE }
    | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
    | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } };
