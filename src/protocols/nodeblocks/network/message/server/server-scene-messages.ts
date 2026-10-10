import { ServerMessageTypes } from "../../server-message-protocol";
import { BaseServerMessage } from "./base-server-message";
import { EngineEventPayload } from "./engine-event-messages";
import { ServerCmdResponsePayload } from "./server-response-payloads";


export type ServerCmdResponse = BaseServerMessage & {
    type: ServerMessageTypes.COMMAND_RESPONSE
    cmd_uid: string
    response_payload: ServerCmdResponsePayload
}

export type ServerWorkerEvent = BaseServerMessage & {
    type: ServerMessageTypes.SCENE_EVENT
    event: string
    data?: any // TODO: worker events
}

export type ServerEngineEvent = BaseServerMessage & {
    type: ServerMessageTypes.GRAPH_EVENT
    event_payload: EngineEventPayload
}

export type ServerSceneMessages = ServerEngineEvent | ServerCmdResponse | ServerWorkerEvent;
