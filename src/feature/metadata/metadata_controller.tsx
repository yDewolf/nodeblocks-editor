import { createStore, reconcile, SetStoreFunction } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { DocsPathPrefix } from "../docs/docs-protocols";
import { BaseMetadata } from "~/protocols/nodeblocks/metadata/base_metadata";
import { MetadataHeader, parse_header } from "~/protocols/nodeblocks/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta, parse_node_types, parse_data_types } from "~/protocols/nodeblocks/metadata/type_metadata";
import { AppSessionManager } from "~/network/app-session-manager";
import { PackageManager } from "../editor/engine/packages/package-manager";

const METADATA_CACHE_KEY = "type_metadata_cache"
export interface MetadataStoreData {
    header: MetadataHeader | null; 
    node_types: Record<string, NodeTypeMeta>;
    data_types: Record<string, DataTypeMeta>;
    interface?: Record<string, BaseMetadata>;
}

// Must have the same keys as MetadataStoreData interface
export const PathPrefixMap: Record<string, DocsPathPrefix> = {
    "header": DocsPathPrefix.HEADER,
    "node_types": DocsPathPrefix.NODE,
    "data_types": DocsPathPrefix.DATATYPE,
    "interface": DocsPathPrefix.UI,
}

export class MetadataController {
    public readonly store: Record<string, MetadataStoreData>;
    private setStore: SetStoreFunction<Record<string, MetadataStoreData>>;

    constructor(
        private readonly appSession: AppSessionManager,
        private readonly packageManager: PackageManager
        // private readonly sceneConnection?: SceneConnectionManager
    ) {
        const [store, setStore] = makePersisted(
            createStore<Record<string, MetadataStoreData>>({}), 
            { name: METADATA_CACHE_KEY }
        );
        
        this.store = store;
        this.setStore = setStore;

        this.packageManager.subscribePackageLoad((packages: string[]) => {
            for (const package_id of packages) {
                this.update_metadata(package_id);
            }
        })

        // this._client.add_handler(ServerMessages.SYNC_VERSIONS, async (message) => {
        //     if (message.types && message.metadata) {
        //         this.update_metadata(
        //             message.types.package_id, {
        //                 meta_version: message.metadata.meta_version, 
        //                 types_version: message.metadata.types_version
        //             }
        //         );
        //     }
        //     if (!message.metadata) {
        //         this.request_metadata();
        //     }
        // });

        // this._client.add_handler(ServerMessages.METADATA_UPDATED, (message) => {
        //     this.request_metadata();
        // });
    }

    public insertMetadata(id: string, metadata: MetadataStoreData) {
        this.setStore(id, reconcile(metadata));
    }

    public update_metadata = async (package_id: string) => {
        const target_metadata = this.store[package_id];
        
        // FIXME: fix how we handle meta version
        // if (
        //     target_metadata &&
        //     target_metadata.header?.package_version === new_version.package_version &&
        //     target_metadata.header?.meta_version === new_version.meta_version
        // ) {
        //     console.log("Metadata loaded from cache...");
        //     this.current_types_id = package_id;
        //     return;
        // }
        
        console.warn("Couldn't load metadata from cache. Fetching metadata from server");
        this.request_metadata(package_id);
    };

    protected check_is_updated = async (package_id: string) => {
        const header_url = new URL(`${this.appSession.baseHttpUrl}/api/plugins/${package_id}/metadata/header`);
        const headerRes = await fetch(header_url).then(r => r.json());
        const header_meta: MetadataHeader = parse_header(headerRes);

        const target_metadata = this.store[headerRes.types.id];
        if (!target_metadata) return false;
        if (target_metadata.header?.meta_version !== header_meta.meta_version) return false;
        if (target_metadata.header?.package_version !== header_meta.package_version) return false;
        return true;
    };

    protected request_metadata = async (package_id: string) => {
        console.log("Starting metadata request");
        try {
            const header_url = new URL(`${this.appSession.baseHttpUrl}/api/plugins/${package_id}/metadata/header`);
            const node_url = new URL("nodetypes", header_url);
            const datatypes_url = new URL("datatypes", header_url);
            // if (this._client.session_token) {
            //     header_url.searchParams.append("token", this._client.session_token);
            //     node_url.searchParams.append("token", this._client.session_token);
            //     datatypes_url.searchParams.append("token", this._client.session_token);
            // } else {
            //     throw Error("Missing Session Token");
            // }
            
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
            
            this.insertMetadata(header_meta.package_id, data);
            console.log("Fetched meta: ", header_meta);

        } catch (error) {
            console.error("Failed to fetch metadata from server", error);
        }
    };

    public get_all() {
        return this.store;
    }

    public get_header(root_id: string) {
        return root_id ? this.store[root_id]?.header : null;
    }

    public get_categories(root_id: string) {
        return root_id ? this.store[root_id]?.header?.categories : undefined;
    }

    public get_tags(root_id: string) {
        return root_id ? this.store[root_id]?.header?.tags : undefined;
    }
    
    public get_node_meta(type_id: string, root_id: string) {
        return root_id ? this.store[root_id]?.node_types[type_id] : undefined;
    }

    public get_datatype_meta(datatype_id: string, root_id: string) {
        return root_id ? this.store[root_id]?.data_types[datatype_id] : undefined;
    }

    public get_all_nodes(root_id?: string) {
        return root_id ? this.store[root_id]?.node_types : {};
    }
}