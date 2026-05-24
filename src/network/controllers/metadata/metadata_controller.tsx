import { createStore, reconcile } from "solid-js/store";
import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { MetadataVersion } from "~/wrapper/metadata/metadata_interfaces";
import { DataTypeMeta, MetadataHeader, NodeTypeMeta } from "./type_metadata";
import { makePersisted } from "@solid-primitives/storage";

const METADATA_CACHE_KEY = "type_metadata_cache"
export interface MetadataStoreData {
    header: MetadataHeader | null; 
    node_types: Record<string, NodeTypeMeta>;
    data_types: Record<string, DataTypeMeta>;
}

export class MetadataController {
    private _client: NodeServerClient;
    private metadata_version?: MetadataVersion = undefined;
    
    public readonly store: MetadataStoreData;
    private setStore: any;

    constructor(client: NodeServerClient) {
        this._client = client;
        const [store, setStore] = makePersisted(
            createStore<MetadataStoreData>({
            header: null,
            node_types: {},
            data_types: {}
        }));
        
        this.store = store;
        this.setStore = setStore;
        if (this.store.header) {
            this.metadata_version = {
                meta_version: this.store.header.meta_version,
                types_version: this.store.header.types_version
            }
        } else {
            console.warn("Couldn't load metadata from cache. Fetching metadata from server")
            this.update_metadata({meta_version: 0, types_version: 0})
        }
    }

    public update_metadata = async (new_version: MetadataVersion) => {
        if (
            this.metadata_version?.types_version === new_version.types_version &&
            this.metadata_version?.meta_version === new_version.meta_version
        ) {
            return;
        }

        this.metadata_version = new_version;
        try {
            const metadata_url = new URL(`${this._client.base_http_url}/api/metadata`);
            const node_url = new URL("metadata/nodes", metadata_url);
            const datatypes_url = new URL("metadata/datatypes", metadata_url);
            if (this._client.session_token) {
                metadata_url.searchParams.append("token", this._client.session_token);
                node_url.searchParams.append("token", this._client.session_token);
                datatypes_url.searchParams.append("token", this._client.session_token);
            }
            const [headerRes, nodesRes, datatypesRes] = await Promise.all([
                fetch(metadata_url).then(r => r.json()),
                fetch(node_url).then(r => r.json()),
                fetch(datatypes_url).then(r => r.json())
            ]);

            this.setStore("header", reconcile(headerRes));
            this.setStore("node_types", reconcile(nodesRes));
            this.setStore("data_types", reconcile(datatypesRes));
            console.log(headerRes, nodesRes, datatypesRes)
            // this.save_to_cache();

        } catch (error) {
            console.error("Failed to fetch metadata from server", error);
        }
    }

    
    public get_header() {
        return this.store.header;
    }

    public get_node_meta(type_id: string) {
        return this.store.node_types[type_id];
    }

    public get_datatype_meta(datatype_id: string) {
        return this.store.data_types[datatype_id];
    }

    public get_all_nodes() {
        return this.store.node_types;
    }
}