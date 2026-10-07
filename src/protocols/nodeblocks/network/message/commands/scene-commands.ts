
import { ClientSceneCommandTypes } from "../../client-command-protocol";
import { CommandGroups } from "../../client-command-protocol";
import { BaseClientCommand } from "./base-client-command";


// Scene Commands
export type ClientLoadSceneCmd = BaseClientCommand & {
    cmd_group: CommandGroups.SCENE;
    type: ClientSceneCommandTypes.LOAD_SCENE;
    payload: any; // SceneData
};


export type SceneCommand = ClientLoadSceneCmd;
