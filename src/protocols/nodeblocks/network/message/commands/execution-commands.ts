import { SceneWorkerExecutionMode } from "../../scene-worker-protocol";
import { SceneWorkerExecutionState } from "../../scene-worker-protocol";
import { ExecutionShortcuts } from "../../client-command-protocol";
import { SceneExecutionCmdTypes } from "../../client-command-protocol";
import { CommandGroups } from "../../client-command-protocol";
import { BaseClientCommand } from "./base-client-command";

// Execution Commands

export type SetExecutionStateCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.SET_EXECUTION_STATE;
    state: SceneWorkerExecutionState;
    target_iterations?: number;
};

export type SetExecutionModeCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.SET_EXECUTION_MODE;
    mode: SceneWorkerExecutionMode;
};

export type ExecutionShortcutCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT;
    shortcut: ExecutionShortcuts;
};

export type ExecutionCommand = SetExecutionStateCmd | SetExecutionModeCmd | ExecutionShortcutCmd;
