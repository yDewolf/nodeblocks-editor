import { DocsPathSplitter, metadata } from "~/singletons/metadata";
import { MetadataController, MetadataStoreData } from "../metadata/metadata_controller";
import { DocPayload, DocsPathPrefix } from "./docs-interfaces";
import { DataTypeMeta, NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { BaseMetadata } from "~/wrapper/metadata/base_metadata";
import { MetadataHeader } from "~/wrapper/metadata/header_metadata";
import { DocsPathUtils } from "~/helpers/docs-path-utils";

const LOCAL_DATA_ID = "builtin";

const interfaceModules = import.meta.glob("/src/docs/builtin/interface/**/*.json");
const datatypeModules = import.meta.glob("/src/docs/builtin/datatypes/**/*.json");

export class DocsResolver {
    private _metadata_controller: MetadataController;

    constructor() {
        this._metadata_controller = metadata;
        this.injectLocalData();
    }

    private async injectLocalData() {
        // FIX: Insert Node Type modules here if needed
        const header_meta: MetadataHeader = {
            capitalized_name: "Builtin",
            description: "Metadata for builtin node types and UI elements.",
            types_id: "builtin",
            meta_version: 0,
            types_version: 0,
            last_modified: 0,
            tags: {},
            categories: {}
        };
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
            header: header_meta,
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
        const path_root = DocsPathUtils.extractRootId(docs_path);
        if (docs_path == path_root) {
            const meta = this._metadata_controller.get_header(path_root);

            if (!meta) throw new Error(`Couldn't find metadata root ${path_root}`);
            return { type: "header", data: meta }
        } 

        const target_id = DocsPathUtils.extractTargetId(docs_path);
        if (!target_id) {
            throw new Error(`Missing target id for path: ${docs_path}`);
        }

        if (DocsPathUtils.isType(docs_path, DocsPathPrefix.NODE)) {
            const meta = this._metadata_controller.get_node_meta(target_id, path_root);
            if (!meta) throw new Error(`Couldn't find metadata for node ${target_id}`);
            return { type: "node", data: meta };
        }

        if (DocsPathUtils.isType(docs_path, DocsPathPrefix.DATATYPE)) {
            const meta = this._metadata_controller.get_datatype_meta(target_id, path_root);
            if (!meta) {
                const local_path = docs_path.replaceAll(DocsPathSplitter, "/");
                const full_path = `/src/docs/${local_path}.json`;
                return {type: "datatype", data: await this.load_local_metadata(full_path, datatypeModules)};
            };
            return { type: "datatype", data: meta };
        }

        if (DocsPathUtils.isType(docs_path, DocsPathPrefix.UI)) {
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