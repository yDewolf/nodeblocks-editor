import { ServerMessageTypes } from "../../server-message-protocol"

export type BaseServerMessage = {
    type: ServerMessageTypes
}