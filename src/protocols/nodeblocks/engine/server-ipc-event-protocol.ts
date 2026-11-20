export enum CommandStatus {
    SUCCESSFUL = "successful",
    PARTIAL_SUCCESS = "partial_success",
    FAILED = "failed"
}

export type CmdStatusPack = {
    status: CommandStatus
    message?: string
}


export type ServerEvent = {}
export type ServerCommandResponse = ServerEvent & {
    request_id: string
    status: CmdStatusPack
}

export type ServerWorkerEvent = ServerEvent & {}
