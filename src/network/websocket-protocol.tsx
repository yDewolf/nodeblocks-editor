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
    LOAD_SCENE = "LOAD_SCENE",
    SYNC_CLIENT_SCENE = "SYNC_CLIENT_SCENE",
    GET_TYPES = "GET_TYPES",
    
    SET_INSTANCE_STATE = "SET_STATE",
    SET_INSTANCE_LOOP_STATE = "SET_LOOP_STATE",

    NODE_ACTION = "NODE",
    CONNECTION_ACTION = "CONNECTION",

    INSTANCE_COMMAND = "INSTANCE"
}

export enum ServerMessages {
    HANDSHAKE_SYNC = "handshake_sync",
    NODE_OUTPUT = "node_output",
    SYNC_CLIENT_SCENE = "sync_client_scene",
    SYNC_INSTANCE_STATE = "sync_instance_state"
}

export enum WebsocketStatus {
    ERROR = -1,
    CONNECTED = 1,
    DISCONNECTED = 0
}

export enum SceneActions {
    ADD = "ADD",
    REMOVE = "REMOVE",
    UPDATE = "UPDATE"
}