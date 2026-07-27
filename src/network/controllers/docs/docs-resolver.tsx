import { DocsPathSplitter, metadata } from "~/singletons/metadata";
import { MetadataController } from "../metadata/metadata_controller";
import { DocPayload, DocsPath } from "./docs-interfaces";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { BaseDataType } from "~/wrapper/nodes/data/node-data-type";

const interfaceModules = import.meta.glob("/src/docs/interface/**/*.json");
const datatypeModules = import.meta.glob("/src/docs/datatypes/**/*.json");
export function make_node_docs_path(node?: GraphNode, type_id?: string): string | undefined {
    return DocsPath.NODE + DocsPathSplitter + (node ? node.type_id : type_id)
}

export function make_datatype_docs_path(datatype?: BaseDataType, slot?: NodeSlot): string | undefined{
    if (datatype) {
        return DocsPath.DATATYPE + DocsPathSplitter + datatype.type_id;
    }

    if (slot) {
        return DocsPath.DATATYPE + DocsPathSplitter + slot.data_type.type_id;
    }

    return undefined;
}

export function make_ui_docs_path(docs_element_id: string) {
    return DocsPath.UI + DocsPathSplitter + docs_element_id;
}

export class DocsResolver {
    private _metadata_controller: MetadataController;

    constructor() {
        this._metadata_controller = metadata;
    }

    public allData() {
        return this._metadata_controller.get_all();
    }

    public async resolve(docs_path: string): Promise<DocPayload> {
        if (docs_path.startsWith(DocsPath.NODE)) {
            const type_id = docs_path.replace(DocsPath.NODE + DocsPathSplitter, "");
            const meta = this._metadata_controller.get_node_meta(type_id);

            if (!meta) throw new Error(`Couldn't find metadata for node ${type_id}`);
            return { type: "node", data: meta };
        }

        if (docs_path.startsWith(DocsPath.DATATYPE)) {
            const datatype_id = docs_path.replace(DocsPath.DATATYPE + DocsPathSplitter, "");
            const meta = this._metadata_controller.get_datatype_meta(datatype_id);
            
            if (!meta) {
                const local_path = docs_path.replace(DocsPathSplitter, "/");
                const full_path = `/src/docs/${local_path}.json`;
                const loader = datatypeModules[full_path];
                if (!loader) throw new Error(`Couldn't find metadata for ${datatype_id}`);
                
                const raw_module = await loader() as any;
                const json_data = raw_module.default ?? raw_module;
                return { type: "datatype", data: json_data };
            };
            return { type: "datatype", data: meta };
        }

        if (docs_path.startsWith(DocsPath.UI)) {
            const ui_path = docs_path.replace(DocsPathSplitter, "/");
            const full_path = `/src/docs/${ui_path}.json`;
            const loader = interfaceModules[full_path];

            if (!loader) throw new Error(`Couldn't find metadata for UI element. Path: ${docs_path}`);

            const raw_module = await loader() as any;
            const json_data = raw_module.default ?? raw_module;

            return { type: "interface", data: json_data };
        }

        throw new Error(`Invalid docs path format ${docs_path}`);
    }
}