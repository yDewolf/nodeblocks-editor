import { NodeSceneData, ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { ClientGraphCommandTypes } from "../../client-command-protocol";
import { GraphActionTypes } from "../../client-command-protocol";
import { CommandGroups } from "../../client-command-protocol";
import { BaseClientCommand } from "./base-client-command";

export type NodeSceneRequestData = { [uid: string]: NodeSceneData; };
export type ConnSceneRequestData = { [uid: string]: ConnectionSceneData; };

export type NodeActionPayload = { action: GraphActionTypes.ADD | GraphActionTypes.UPDATE; action_data: NodeSceneRequestData; } |
{ action: GraphActionTypes.REMOVE; uids: string[]; };

export type ConnActionPayload = { action: GraphActionTypes.ADD | GraphActionTypes.UPDATE; action_data: ConnSceneRequestData; } |
{ action: GraphActionTypes.REMOVE; uids: string[]; };

// Graph Commands
export type NodeGraphCommand = BaseClientCommand & {
    cmd_group: CommandGroups.GRAPH;
    type: ClientGraphCommandTypes.NODE;
    payload: NodeActionPayload;
};

export type ConnGraphCommand = BaseClientCommand & {
    cmd_group: CommandGroups.GRAPH;
    type: ClientGraphCommandTypes.CONN;
    payload: ConnActionPayload;
};

export type SceneGraphCommand = NodeGraphCommand | ConnGraphCommand;


