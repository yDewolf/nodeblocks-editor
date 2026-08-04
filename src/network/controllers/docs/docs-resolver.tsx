import { DocsPathSplitter, metadata } from "~/singletons/metadata";
import { MetadataController, MetadataStoreData } from "../metadata/metadata_controller";
import { DocPayload, DocsPath } from "./docs-interfaces";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { BaseDataType } from "~/wrapper/nodes/data/node-data-type";
import { DataTypeMeta, NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { BaseMetadata } from "~/wrapper/metadata/base_metadata";

const LOCAL_DATA_ID = "builtin";

const interfaceModules = import.meta.glob("/src/docs/builtin/interface/**/*.json");
const datatypeModules = import.meta.glob("/src/docs/builtin/datatypes/**/*.json");
export function make_node_docs_path(root_id: string, node?: GraphNode, type_id?: string): string | undefined {
    return root_id + DocsPathSplitter + DocsPath.NODE + DocsPathSplitter + (node ? node.type_id : type_id)
}

export function make_datatype_docs_path(root_id: string, datatype?: BaseDataType, slot?: NodeSlot): string | undefined{
    if (datatype) {
        return root_id + DocsPathSplitter + DocsPath.DATATYPE + DocsPathSplitter + datatype.type_id;
    }

    if (slot) {
        return root_id + DocsPathSplitter + DocsPath.DATATYPE + DocsPathSplitter + slot.data_type.type_id;
    }

    return undefined;
}

export function make_ui_docs_path(root_id: string, docs_element_id: string) {
    return root_id + DocsPathSplitter + DocsPath.UI + DocsPathSplitter + docs_element_id;
}

export class DocsResolver {
    private _metadata_controller: MetadataController;

    constructor() {
        this._metadata_controller = metadata;
        this.injectLocalData();
    }

    private async injectLocalData() {
        // FIX: Insert Node Type modules here if needed
        let node_types: Record<string, NodeTypeMeta> = {};
        let data_types: Record<string, DataTypeMeta> = {};
        for (const path in datatypeModules) {
            const filename = path.split("/").at(-1)?.replace(".json", "");
            if (!filename) {
                console.error("Couldn't get filename from path: ", path);
                continue;
            }
            data_types[filename] = await this.load_local_metadata(path, datatypeModules);
        }
        let interface_meta: Record<string, BaseMetadata> = {};
        for (const path in interfaceModules) {
            const filename = path.split("/").at(-1)?.replace(".json", "");
            if (!filename) {
                console.error("Couldn't get filename from path: ", path);
                continue;
            }
            interface_meta[filename] = await this.load_local_metadata(path, interfaceModules);
        }

        const local_data: MetadataStoreData = {
            header: null,
            node_types: node_types,
            data_types: data_types,
            interface: interface_meta
        };
        this._metadata_controller.insertMetadata(LOCAL_DATA_ID, local_data);
        return local_data;
    }

    public allData() {
        return this._metadata_controller.get_all();
    }

    public async resolve(docs_path: string): Promise<DocPayload> {
        const path_parts = docs_path.split(DocsPathSplitter);
        const path_root = path_parts.at(0) ?? "";
        const rootless_path = docs_path.replace(path_root + DocsPathSplitter, "");

        if (rootless_path.startsWith(DocsPath.NODE)) {
            const type_id = rootless_path.replace(DocsPath.NODE + DocsPathSplitter, "");
            const meta = this._metadata_controller.get_node_meta(type_id, path_root);

            if (!meta) throw new Error(`Couldn't find metadata for node ${type_id}`);
            return { type: "node", data: meta };
        }

        if (rootless_path.startsWith(DocsPath.DATATYPE)) {
            const datatype_id = rootless_path.replace(DocsPath.DATATYPE + DocsPathSplitter, "");
            const meta = this._metadata_controller.get_datatype_meta(datatype_id, path_root);
            
            if (!meta) {
                const local_path = docs_path.replaceAll(DocsPathSplitter, "/");
                const full_path = `/src/docs/${local_path}.json`;
                return {type: "datatype", data: await this.load_local_metadata(full_path, datatypeModules)};
            };
            return { type: "datatype", data: meta };
        }

        if (rootless_path.startsWith(DocsPath.UI)) {
            const ui_path = docs_path.replaceAll(DocsPathSplitter, "/");
            const full_path = `/src/docs/${ui_path}.json`;
            return {type: "interface", data: await this.load_local_metadata(full_path, interfaceModules)};
        }

        throw new Error(`Invalid docs path format ${docs_path}`);
    }

    protected async load_local_metadata(full_path: string, modules: Record<string, () => Promise<any>>) {
        const loader = modules[full_path];
        if (!loader) throw new Error(`Couldn't find metadata for path: ${full_path}`);

        const raw_module = await loader() as any;
        const json_data = raw_module.default ?? raw_module;

        return json_data;
    }
}