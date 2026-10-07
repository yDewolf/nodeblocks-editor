import { ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node_graph_data";
import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node_graph_data";
import { CommandGroups, GraphActionTypes, ClientGraphCommandTypes, ClientSceneCommandTypes, SceneExecutionCmdTypes, ExecutionShortcuts, SceneWorkerExecutionState, SceneWorkerExecutionMode,ServerMessages, EditorActionStatus } from "./websocket-protocol";
import { ServerNotification, NotificationWithMeta } from './requests/notifications';
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package_manifest";
import { Metadata, MetadataVersion } from "~/wrapper/metadata/header_metadata";
import { NodeOutput } from "~/wrapper/nodes/graph-node";

export type NodeSceneRequestData = { [uid: string]: NodeSceneData };
export type ConnSceneRequestData = { [uid: string]: ConnectionSceneData };

export type NodeActionPayload = 
    | { action: GraphActionTypes.ADD | GraphActionTypes.UPDATE; action_data: NodeSceneRequestData }
    | { action: GraphActionTypes.REMOVE; uids: string[] };

export type ConnActionPayload = 
    | { action: GraphActionTypes.ADD | GraphActionTypes.UPDATE; action_data: ConnSceneRequestData }
    | { action: GraphActionTypes.REMOVE; uids: string[] };


export type BaseClientCommand = {
    cmd_uid: string;
    cmd_group: CommandGroups;
};

// Graph Commands
export type NodeGraphCommand = BaseClientCommand & {
    cmd_group: CommandGroups.GRAPH;
    type: ClientGraphCommandTypes.NODE;
    payload: NodeActionPayload;
};

export type ConnGraphCommand = BaseClientCommand & {
    cmd_group: CommandGroups.GRAPH;
    type: ClientGraphCommandTypes.CONN;
    payload: ConnActionPayload;
};

export type SceneGraphCommand = NodeGraphCommand | ConnGraphCommand;

// Scene Commands
export type ClientLoadSceneCmd = BaseClientCommand & {
    cmd_group: CommandGroups.SCENE;
    type: ClientSceneCommandTypes.LOAD_SCENE;
    payload: any; // SceneData
};

export type SceneCommand = ClientLoadSceneCmd;

// Execution Commands
export type SetExecutionStateCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.SET_EXECUTION_STATE;
    state: SceneWorkerExecutionState;
    target_iterations?: number;
};

export type SetExecutionModeCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.SET_EXECUTION_MODE;
    mode: SceneWorkerExecutionMode;
};

export type ExecutionShortcutCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT;
    shortcut: ExecutionShortcuts;
};

export type ExecutionCommand = SetExecutionStateCmd | SetExecutionModeCmd | ExecutionShortcutCmd;


// Client Command Union
export type ClientCommand = SceneGraphCommand | SceneCommand | ExecutionCommand;
export type ClientMessageWrapper = {
    payload: ClientCommand;
};


// Server Messages
export type ServerVersionSync = {
    types?: PackageManifest;
    metadata?: Metadata;
};

export type ServerMessage = 
    | (ServerVersionSync & { type: ServerMessages.SYNC_VERSIONS })
    | { type: ServerMessages.METADATA_UPDATED; metadata_version: MetadataVersion }
    | { type: ServerMessages.NODE_OUTPUT; node_id: string; value: NodeOutput }
    | { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string }
    | { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any }
    | { type: ServerMessages.SYNC_INSTANCE_STATE; payload: { loop_state: any; instance_state: any } }
    | { type: ServerMessages.SYNC_ACTION; action_statuses: { [uid: string]: EditorActionStatus } }
    | { type: ServerMessages.SYNC_FILES }
    | { type: ServerMessages.SYNC_NOTIFICATIONS; notifications: ServerNotification[] }
    | { type: ServerMessages.CLOSE_SOCKET }
    | ServerNotification;


    
// export type ClientMessage = ClientCommand | ClientAction;
// export type ClientCommand = 
//     | (ClientVersionSync & { type: ClientMessages.SYNC_VERSIONS })
//     | { type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands} }
//     | { type: ClientMessages.LOAD_SCENE; payload: any }
//     | { type: ClientMessages.SYNC_CLIENT_SCENE }
//     | { type: ClientMessages.SET_INSTANCE_LOOP_STATE; payload: { state: LoopStates } }
//     | { type: ClientMessages.SET_INSTANCE_STATE; payload: { state: InstanceStates } }
//     | { type: ClientMessages.UPDATE_NOTIFICATION; payload: NotificationWithMeta }
//     | { type: ClientMessages.SYNC_NOTIFICATIONS};
    
// export type ClientAction = 
//     | { type: ClientMessages.NODE_ACTION, payload: NodeActionPayload, action_uid: string }
//     | { type: ClientMessages.CONNECTION_ACTION, payload: ConnectionActionPayload, action_uid: string }
