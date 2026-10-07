import { CommandGroups } from "../../client-command-protocol";

export type BaseClientCommand = {
    cmd_uid: string;
    cmd_group: CommandGroups;
};
