
import { ServerNotification } from "~/network/websocket/requests/notifications";
import { Metadata, MetadataVersion } from "~/wrapper/metadata/header_metadata";
import { NodeOutput } from "~/wrapper/nodes/graph-node";
import { PackageManifest } from "../../manifests/package-manifest";
import { ServerMessages, EditorActionStatus } from "../server-message-protocol";
import { ServerSceneMessages } from "./server/server-scene-messages";

// TODO: refatorar essas mensagens aqui
// Server Messages
export type ServerVersionSync = {
    types?: PackageManifest;
    metadata?: Metadata;
};

// TODO: refatorar essas mensagens
export type ServerMessage = (ServerVersionSync 
    & { type: ServerMessages.SYNC_VERSIONS; }) |
    { type: ServerMessages.METADATA_UPDATED; metadata_version: MetadataVersion; } |
    { type: ServerMessages.NODE_OUTPUT; node_id: string; value: NodeOutput; } |
    { type: ServerMessages.HANDSHAKE_SYNC; status: number; session: string; } |
    { type: ServerMessages.SYNC_CLIENT_SCENE; payload: any; } |
    { type: ServerMessages.SYNC_INSTANCE_STATE; payload: { loop_state: any; instance_state: any; }; } |
    { type: ServerMessages.SYNC_ACTION; action_statuses: { [uid: string]: EditorActionStatus; }; } |
    { type: ServerMessages.SYNC_FILES; } |
    { type: ServerMessages.SYNC_NOTIFICATIONS; notifications: ServerNotification[]; } |
    { type: ServerMessages.CLOSE_SOCKET; }
    | ServerSceneMessages
    | ServerNotification;

