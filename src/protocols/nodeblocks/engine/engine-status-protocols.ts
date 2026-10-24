export enum JobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    PARTIAL_SUCCESS = "partial_success"
}

export enum NodeExecutionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
    SKIPPED = "skipped"
}