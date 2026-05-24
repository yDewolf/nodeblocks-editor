export enum InstanceStates {
    WAITING = 0,
    RUNNING = 1
}

export enum LoopStates {
    AUTO_LOOP = "auto_loop",
    WAIT_RESUME = "wait_resume",
    WAIT_STEP = "wait_step"
}

export enum InstanceCommands {
    STEP = "STEP",
    RESUME = "RESUME",
    STOP = "STOP",
    RUN = "RUN"
}


export enum ClientMessages {
    SYNC_VERSIONS = "VERSION_SYNC",
    LOAD_SCENE = "LOAD_SCENE",
    SYNC_CLIENT_SCENE = "SYNC_CLIENT_SCENE",
    GET_TYPES = "GET_TYPES",
    
    SET_INSTANCE_STATE = "SET_STATE",
    SET_INSTANCE_LOOP_STATE = "SET_LOOP_STATE",

    // FIXME: Make another enum for these (server and client) 
    // something like ClientActions or EditorActionTypes
    NODE_ACTION = "NODE",
    CONNECTION_ACTION = "CONNECTION",

    UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION",
    SYNC_NOTIFICATIONS = "SYNC_NOTIFICATIONS",

    INSTANCE_COMMAND = "INSTANCE"
}

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

    CLOSE_SOCKET = "disconnect"
}

export enum WebsocketStatus {
    ERROR = -1,
    CONNECTED = 1,
    DISCONNECTED = 0
}

export enum SceneActionTypes {
    ADD = "ADD",
    REMOVE = "REMOVE",
    UPDATE = "UPDATE"
}

export enum EditorActionStatus {
    SUCCESSFULL = "SUCCESSFULL",
    UNSYNCED = "UNSYNCED",
    FAILED = "FAILED"
}

