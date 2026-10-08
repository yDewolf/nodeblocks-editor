export enum CommandStatus {
    SUCCESSFUL = "successful",
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

