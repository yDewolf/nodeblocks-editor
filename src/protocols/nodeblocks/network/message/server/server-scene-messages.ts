import { ServerMessageTypes } from "../../server-message-protocol";
import { BaseServerMessage } from "./base-server-message";
import { ServerCmdResponsePayload } from "./server-response-payloads";


export type ServerEngineEvent = BaseServerMessage & {
    type: ServerMessageTypes.SCENE_EVENT
    event_type: string
    data: any // TODO: adicionar os engine events
}

export type ServerCmdResponse = BaseServerMessage & {
    type: ServerMessageTypes.COMMAND_RESPONSE
    cmd_uid: string
    response_payload: ServerCmdResponsePayload
}

export type ServerSceneMessages = ServerEngineEvent | ServerCmdResponse;
