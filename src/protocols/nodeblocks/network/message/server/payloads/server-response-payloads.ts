import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data"
import { SceneWorkerExecutionMode, SceneWorkerExecutionState } from "../../../scene-worker-protocol"
import { ServerCmdResponseTypes } from "../../../server-message-protocol"
import { CmdStatusPack } from "../../../../engine/server-ipc-event-protocol"

export type CommandResponsePayload = {
    type: ServerCmdResponseTypes

    request_id: string,
    status: CmdStatusPack
}

export type GenericCmdPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.SCENE_WORKER
}

export type ExecutionStateSyncPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.EXECUTION_STATE_SYNC
    state: SceneWorkerExecutionState
    mode: SceneWorkerExecutionMode
    target_iterations?: number
    target_nodes?: string[] 
}

export type AddNodePayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.ADD_NODE
    nodes?: Array<string>
}

export type AddConnPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.ADD_CONN
    conns?: Array<string>
}

export type GetSceneDataPayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.GET_SCENE_DATA
    scene_data?: SceneData
}

export type SaveScenePayload = CommandResponsePayload & {
    type: ServerCmdResponseTypes.SAVE_SCENE
}

export type ServerCmdResponsePayload = 
    | GenericCmdPayload | ExecutionStateSyncPayload 
    | AddNodePayload | AddConnPayload
    | GetSceneDataPayload | SaveScenePayload;
