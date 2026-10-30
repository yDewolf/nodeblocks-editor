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

export enum ServerMessageTypes {
    CLOSE_SOCKET = "close_socket",
    GRAPH_EVENT = "graph_event",
    SCENE_EVENT = "scene_event",
    COMMAND_RESPONSE = "cmd_response"
}

export enum WebsocketStatus {
    ERROR = -1,
    CONNECTING = 2,
    CONNECTED = 1,
    DISCONNECTED = 0
}

export enum EditorActionStatus {
    SUCCESSFUL = "successful",
    UNSYNCED = "unsynced",
    FAILED = "failed",
    REVERTED = "reverted"
}


export enum ServerCmdResponseTypes {
    SCENE_WORKER = "scene_worker",
    
    EXECUTION_STATE_SYNC = "execution_state_sync",
    ADD_NODE = "add_node",
    ADD_CONN = "add_conn",
    GET_SCENE_DATA = "get_scene_data",
    SAVE_SCENE = "save_scene"
}

export enum ServerEngineEventTypes {
    NODE_STATUS = "node_status_changed",
    JOB_STATUS = "job_status_changed",
    FAILED_PROCESS = "failed_process",
    RUNTIME_ERROR = "runtime_error"
}