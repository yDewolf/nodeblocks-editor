import { ExecutionCommand } from "./commands/execution-commands";
import { SceneCommand } from "./commands/scene-commands";
import { SceneGraphCommand } from "./commands/node-graph-commands";
import { CommandGroups } from "../client-command-protocol";

// Client Command Union

export type ClientCommand = 
    | SceneGraphCommand | SceneCommand | ExecutionCommand 
    | { cmd_group: CommandGroups.NOTIFICATION };

export type ClientMessageWrapper = {
    payload: ClientCommand;
};

