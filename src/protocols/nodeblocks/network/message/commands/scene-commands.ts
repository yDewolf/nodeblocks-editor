
import { ClientSceneCommandTypes } from "../../client-command-protocol";
import { CommandGroups } from "../../client-command-protocol";
import { BaseClientCommand } from "./base-client-command";


type BaseSceneCmd = BaseClientCommand & {
    cmd_group: CommandGroups.SCENE
}

// Scene Commands
export type ClientLoadSceneCmd = BaseSceneCmd & {
    type: ClientSceneCommandTypes.LOAD_SCENE;
    payload: any; // SceneData
};

export type ClientSaveSceneCmd = BaseSceneCmd & {
    type: ClientSceneCommandTypes.SAVE_SCENE
}

export type ClientGetSceneDataCmd = BaseSceneCmd & {
    type: ClientSceneCommandTypes.GET_SCENE_DATA
}

export type SceneCommand = ClientLoadSceneCmd | ClientSaveSceneCmd | ClientGetSceneDataCmd;
