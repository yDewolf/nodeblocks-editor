import { createStore, reconcile, SetStoreFunction } from "solid-js/store";
import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { makePersisted } from "@solid-primitives/storage";
import { Metadata, MetadataHeader, MetadataVersion, parse_header } from "../../../wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta, ParameterMeta, SlotMeta, parse_node_types, parse_data_types, parse_node_type } from "../../../wrapper/metadata/type_metadata";
import { ServerMessages } from "~/network/websocket/websocket-protocol";
import { createSignal } from "solid-js";

const METADATA_CACHE_KEY = "type_metadata_cache"
export interface MetadataStoreData {
    header: MetadataHeader | null; 
    node_types: Record<string, NodeTypeMeta>;
    data_types: Record<string, DataTypeMeta>;
}

export class MetadataController {
    private _client: NodeServerClient;
    private _current_id = createSignal<string | undefined>(undefined);
    
    public readonly store: Record<string, MetadataStoreData>;
    private setStore: SetStoreFunction<Record<string, MetadataStoreData>>;

    constructor(client: NodeServerClient) {
        this._client = client;
        const [store, setStore] = makePersisted(
            createStore<Record<string, MetadataStoreData>>({}), 
            { name: METADATA_CACHE_KEY }
        );
        
        this.store = store;
        this.setStore = setStore;

        this._client.add_handler(ServerMessages.SYNC_VERSIONS, async (message) => {
            if (message.types && message.metadata) {
                this.update_metadata(
                    message.types.id, {
                        meta_version: message.metadata.meta_version, 
                        types_version: message.metadata.types_version
                    }
                );
            }
            if (!message.metadata) {
                this.request_metadata();
            }
        });

        this._client.add_handler(ServerMessages.METADATA_UPDATED, (message) => {
            this.request_metadata();
        });
    }

    private get current_types_id(): string | undefined {
        return this._current_id[0]();
    }
    private set current_types_id(value: string | undefined) {
        this._current_id[1](value);
    }

    public update_metadata = async (types_id: string, new_version: MetadataVersion) => {
        const target_metadata = this.store[types_id];
        
        if (
            target_metadata &&
            target_metadata.header?.types_version === new_version.types_version &&
            target_metadata.header?.meta_version === new_version.meta_version
        ) {
            console.log("Metadata loaded from cache...");
            this.current_types_id = types_id;
            return;
        }
        
        console.warn("Couldn't load metadata from cache. Fetching metadata from server");
        this.request_metadata();
    };

    protected check_is_updated = async () => {
        const header_url = new URL(`${this._client.base_http_url}/api/metadata`);
        const headerRes = await fetch(header_url).then(r => r.json());
        const header_meta: MetadataHeader = parse_header(headerRes);

        const target_metadata = this.store[headerRes.types.id];
        if (!target_metadata) return false;
        if (target_metadata.header?.meta_version !== header_meta.meta_version) return false;
        if (target_metadata.header?.types_version !== header_meta.types_version) return false;
        return true;
    };

    protected request_metadata = async () => {
        console.log("Starting metadata request");
        try {
            const header_url = new URL(`${this._client.base_http_url}/api/metadata`);
            const node_url = new URL("metadata/nodes", header_url);
            const datatypes_url = new URL("metadata/datatypes", header_url);
            
            if (this._client.session_token) {
                header_url.searchParams.append("token", this._client.session_token);
                node_url.searchParams.append("token", this._client.session_token);
                datatypes_url.searchParams.append("token", this._client.session_token);
            } else {
                throw Error("Missing Session Token");
            }
            
            const [headerRes, nodesRes, datatypesRes] = await Promise.all([
                fetch(header_url).then(r => r.json()),
                fetch(node_url).then(r => r.json()),
                fetch(datatypes_url).then(r => r.json())
            ]);

            const header_meta: MetadataHeader = parse_header(headerRes);
            const node_types: Record<string, NodeTypeMeta> = parse_node_types(nodesRes, header_meta.tags, header_meta.categories);
            const data_types: Record<string, DataTypeMeta> = parse_data_types(datatypesRes);
            
            const data: MetadataStoreData = {
                header: header_meta,
                node_types: node_types,
                data_types: data_types
            };
            
            this.setStore(header_meta.types_id, reconcile(data));
            this.current_types_id = header_meta.types_id;
            console.log("Fetched meta: ", header_meta);

        } catch (error) {
            console.error("Failed to fetch metadata from server", error);
        }
    };

    public get_all() {
        return this.store;
    }

    public get_header() {
        const id = this.current_types_id;
        return id ? this.store[id]?.header : null;
    }

    public get_categories() {
        const id = this.current_types_id;
        return id ? this.store[id]?.header?.categories : undefined;
    }

    public get_tags() {
        const id = this.current_types_id;
        return id ? this.store[id]?.header?.tags : undefined;
    }
    
    public get_node_meta(type_id: string) {
        const id = this.current_types_id;
        return id ? this.store[id]?.node_types[type_id] : undefined;
    }

    public get_datatype_meta(datatype_id: string) {
        const id = this.current_types_id;
        return id ? this.store[id]?.data_types[datatype_id] : undefined;
    }

    public get_all_nodes() {
        const id = this.current_types_id;
        return id ? this.store[id]?.node_types : {};
    }
}