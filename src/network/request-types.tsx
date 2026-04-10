import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, SceneActions, ServerMessages } from "./websocket-protocol";


export type ServerMessage = 
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: any }
    | { type: ServerMessages.HANDSHAKE_SYNC; status: string; session: string, type_data: any}
    | { type: ServerMessages.HANDSHAKE_SYNC; message: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: {loop_state: any, instance_state: any} };

export type ClientCommand = 
    | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
    | { type: ClientMessages.LOAD_SCENE; payload: any }
    | { type: ClientMessages.SYNC_CLIENT_SCENE }
    | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
    | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } };
