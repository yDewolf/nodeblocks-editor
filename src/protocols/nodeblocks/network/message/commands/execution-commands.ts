import { SceneWorkerExecutionMode } from "../../scene-worker-protocol";
import { SceneWorkerExecutionState } from "../../scene-worker-protocol";
import { ExecutionShortcuts } from "../../client-command-protocol";
import { SceneExecutionCmdTypes } from "../../client-command-protocol";
import { CommandGroups } from "../../client-command-protocol";
import { BaseClientCommand } from "./base-client-command";

// Execution Commands

export type CheckExecutionStateCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.CHECK_EXECUTION_STATE;
}

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

export type UpdateTargetNodesCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.UPDATE_TARGET_NODES;
    target_nodes: string[];
}

export type UpdateExecutionConfigCmd = BaseClientCommand & {
    cmd_group: CommandGroups.EXECUTION;
    type: SceneExecutionCmdTypes.UPDATE_EXECUTION_CONFIG;
    
    state?: SceneWorkerExecutionState;
    target_iterations?: number;
    mode?: SceneWorkerExecutionMode;
    target_nodes?: string[];
}

export type ExecutionCommand =
    | CheckExecutionStateCmd 
    | SetExecutionStateCmd | SetExecutionModeCmd 
    | ExecutionShortcutCmd 
    | UpdateTargetNodesCmd | UpdateExecutionConfigCmd;
