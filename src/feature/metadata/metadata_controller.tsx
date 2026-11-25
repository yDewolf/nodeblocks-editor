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
    }

    public insertMetadata(id: string, metadata: MetadataStoreData) {
        this.setStore(id, reconcile(metadata));
    }

    public update_metadata = async (package_id: string) => {
        const target_metadata = this.store[package_id];
        this.request_metadata(package_id);
    };

    protected check_is_updated = async (package_id: string) => {
        const header_url = new URL(`${this.appSession.baseHttpUrl}/api/plugins/${package_id}/metadata/header`);
        const headerRes = await fetch(header_url, {headers: this.appSession.defaultHeaders}).then(r => r.json());
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
            if (package_id in this.store) {
                const current_hash = this.store[package_id].header?.content_hash;
                if (current_hash) {
                    header_url.searchParams.append("hash", current_hash);
                    node_url.searchParams.append("hash", current_hash);
                    datatypes_url.searchParams.append("hash", current_hash);
                }
            }
            
            const [headerRes, nodesRes, datatypesRes] = await Promise.all([
                fetch(header_url, {headers: this.appSession.defaultHeaders}).then(r => {
                    if (r.status == 304) { return null; }
                    return r.json();
                }),
                fetch(node_url, {headers: this.appSession.defaultHeaders}).then(r => {
                    if (r.status == 304) { return null; }
                    return r.json();
                }),
                fetch(datatypes_url, {headers: this.appSession.defaultHeaders}).then(r => {
                    if (r.status == 304) { return null; }
                    return r.json();
                })
            ]);

            const header_meta: MetadataHeader = headerRes ? parse_header(headerRes) : this.store[package_id].header!;
            const node_types: Record<string, NodeTypeMeta> = nodesRes ? parse_node_types(nodesRes, header_meta.tags, header_meta.categories) : this.store[package_id].node_types;
            const data_types: Record<string, DataTypeMeta> = datatypesRes ? parse_data_types(datatypesRes) : this.store[package_id].data_types;
            
            const data: MetadataStoreData = {
                header: header_meta,
                node_types: node_types,
                data_types: data_types
            };
            
            this.insertMetadata(header_meta.package_id, data);
            // console.log("Fetched meta: ", header_meta);

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