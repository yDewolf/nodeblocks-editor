

export enum ServerStatuses {
    DISCONNECTED = "disconnected", // clientside
    CONNECTING = "connecting", // clientside
    INITIALIZING = "initializing",
    SETTING_UP = "setting_up",
    READY = "ready",
    FAILED = "failed"
}

export enum ServerEventTypes {
    SERVER_STATUS = "server_status"
}


type BaseServerEvent = {
    type: ServerEventTypes
}

export type ServerStatusEvent = BaseServerEvent & {
    type: ServerEventTypes.SERVER_STATUS
    status: ServerStatuses
    message?: string
}

export type ServerEvents = ServerStatusEvent;
