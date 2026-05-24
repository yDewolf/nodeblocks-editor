import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { ServerMessages } from "~/network/websocket/websocket-protocol";
import { MetadataVersion } from "~/wrapper/metadata/metadata_interfaces";

export class MetadataController {
    private _client: NodeServerClient;
    private metadata_version?: MetadataVersion = undefined;
    
    constructor(client: NodeServerClient) {
        this._client = client;
        this._client.add_handler(ServerMessages.METADATA_UPDATED, (message) => {
            this.update_metadata(message.metadata_version);
        }); 
    }

    // TODO: Implement Metadata Grabber (grab reactive metadata for Node, Slot, DataType, etc)

    // TODO: Implement metadata caching (localStorage stuff)

    // TODO: Implement Metadata Fetching (HTTP)
    public update_metadata = (new_version: MetadataVersion) => {
        console.log("Should fetch new metadata")
        this.metadata_version = this.metadata_version;
    }
}