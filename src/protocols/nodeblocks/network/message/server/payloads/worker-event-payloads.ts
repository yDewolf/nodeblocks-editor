import { WorkerEventTypes } from "~/protocols/nodeblocks/engine/worker-event-types"

type BaseWorkerEventPayload = {
    type: WorkerEventTypes
}

export type WorkerReadyPayload = {
    type: WorkerEventTypes.READY
}

export type WorkerStoppedPayload = {
    type: WorkerEventTypes.STOPPED
}

export type WorkerFatalErrorPayload = {
    type: WorkerEventTypes.FATAL_ERROR
    error: string
}


export type WorkerEventPayload = WorkerReadyPayload | WorkerStoppedPayload | WorkerFatalErrorPayload;
 