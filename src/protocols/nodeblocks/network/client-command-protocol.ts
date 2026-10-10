
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
    LOAD_SCENE = "load_scene",
    SAVE_SCENE = "save_scene",
    GET_SCENE_DATA = "get_scene_data"
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
