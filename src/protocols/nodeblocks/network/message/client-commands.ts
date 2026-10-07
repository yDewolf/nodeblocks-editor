import { ExecutionCommand } from "./commands/execution-commands";
import { SceneCommand } from "./commands/scene-commands";
import { SceneGraphCommand } from "./commands/node-graph-commands";

// Client Command Union

export type ClientCommand = SceneGraphCommand | SceneCommand | ExecutionCommand;

export type ClientMessageWrapper = {
    payload: ClientCommand;
};

