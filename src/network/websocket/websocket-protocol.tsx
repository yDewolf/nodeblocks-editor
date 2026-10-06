export enum CommandGroups {
    SCENE = "scene",
    GRAPH = "graph",
    NOTIFICATION = "notification",
    EXECUTION = "execution"
}

export enum GraphActionTypes {
    ADD = "add",
    REMOVE = "remove",
    UPDATE = "update"
}

export enum ClientGraphCommandTypes {
    NODE = "node",
    CONN = "conn"
}

export enum ClientSceneCommandTypes {
    LOAD_SCENE = "load_scene"
}

export enum SceneExecutionCmdTypes {
    SET_EXECUTION_STATE = "set_execution_state",
    SET_EXECUTION_MODE = "set_execution_mode",
    EXECUTION_SHORTCUT = "execution_shortcut"
}

export enum ExecutionShortcuts {
    EXECUTION_STEP = "step",
    EXECUTION_PAUSE = "pause",
    EXECUTION_CONTINUE = "continue"
}

export enum SceneWorkerExecutionState {
    STOPPED = "stopped",
    RUNNING = "running",
    RUNNING_CONTINUOUS = "continuous"
}

export enum SceneWorkerExecutionMode {
    FULL_GRAPH = "full_graph",
    GRAPH_STEP = "graph_step"
}

// export enum ClientMessages {
//     SYNC_VERSIONS = "VERSION_SYNC",
//     LOAD_SCENE = "LOAD_SCENE",
//     SYNC_CLIENT_SCENE = "SYNC_CLIENT_SCENE",
//     GET_TYPES = "GET_TYPES",
    
//     SET_INSTANCE_STATE = "SET_STATE",
//     SET_INSTANCE_LOOP_STATE = "SET_LOOP_STATE",

//     NODE_ACTION = "NODE",
//     CONNECTION_ACTION = "CONNECTION",

//     UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION",
//     SYNC_NOTIFICATIONS = "SYNC_NOTIFICATIONS",

//     INSTANCE_COMMAND = "INSTANCE"
// }


export enum ServerMessages {
    SYNC_VERSIONS = "version_sync",
    HANDSHAKE_SYNC = "handshake_sync",
    NODE_OUTPUT = "node_output",
    NOTIFICATION = "notification",
    SYNC_CLIENT_SCENE = "sync_client_scene",
    SYNC_INSTANCE_STATE = "sync_instance_state",
    SYNC_ACTION = "sync_action",
    SYNC_FILES = "sync_files",
    SYNC_NOTIFICATIONS = "sync_notifications",
    METADATA_UPDATED = "metadata_updated",
    CLOSE_SOCKET = "disconnect"
}

export enum WebsocketStatus {
    ERROR = -1,
    CONNECTED = 1,
    DISCONNECTED = 0
}

export enum EditorActionStatus {
    SUCCESSFULL = "SUCCESSFULL",
    UNSYNCED = "UNSYNCED",
    FAILED = "FAILED"
}