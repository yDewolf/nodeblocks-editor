import { createStore, reconcile } from "solid-js/store";
import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { makePersisted } from "@solid-primitives/storage";
import { Metadata, MetadataHeader, MetadataVersion, parse_header } from "../../../wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta, ParameterMeta, SlotMeta, parse_node_types, parse_data_types, parse_node_type } from "../../../wrapper/metadata/type_metadata";
import { ServerMessages } from "~/network/websocket/websocket-protocol";
import { NodeCategory, NodeTag } from '../../../wrapper/metadata/node_filters';

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
        }), {name: METADATA_CACHE_KEY});
        
        this.store = store;
        this.setStore = setStore;
        // console.log("Metadata content:", store.header, store.data_types, store.node_types);
        if (this.store.header) {
            this.metadata_version = {
                meta_version: this.store.header.meta_version,
                types_version: this.store.header.types_version
            }
        } else {
            console.warn("Couldn't load metadata from cache. Fetching metadata from server")
            this.update_metadata({meta_version: 0, types_version: 0})
        }

        this._client.add_handler(ServerMessages.METADATA_UPDATED, (message) => {
            this.update_metadata(message.metadata_version);
        });
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
            const header_url = new URL(`${this._client.base_http_url}/api/metadata`);
            const node_url = new URL("metadata/nodes", header_url);
            const datatypes_url = new URL("metadata/datatypes", header_url);
            if (this._client.session_token) {
                header_url.searchParams.append("token", this._client.session_token);
                node_url.searchParams.append("token", this._client.session_token);
                datatypes_url.searchParams.append("token", this._client.session_token);
            }
            const [headerRes, nodesRes, datatypesRes] = await Promise.all([
                fetch(header_url).then(r => r.json()),
                fetch(node_url).then(r => r.json()),
                fetch(datatypes_url).then(r => r.json())
            ]);

            const header_meta: MetadataHeader = parse_header(headerRes);
            const node_types: Record<string, NodeTypeMeta> = parse_node_types(nodesRes, header_meta.tags, header_meta.categories);
            const data_types: Record<string, DataTypeMeta> = parse_data_types(datatypesRes);
            console.log(node_types);
            this.setStore("header", reconcile(header_meta));
            this.setStore("node_types", reconcile(node_types));
            this.setStore("data_types", reconcile(data_types));

        } catch (error) {
            console.error("Failed to fetch metadata from server", error);
        }
    }

    
    public get_header() {
        return this.store.header;
    }

    public get_categories() {
        return this.store.header?.categories;
    }

    public get_tags() {
        return this.store.header?.tags;
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