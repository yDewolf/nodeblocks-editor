import { BaseMetadata } from "~/wrapper/metadata/base_metadata";
import { DataTypeMeta, NodeTypeMeta } from "~/wrapper/metadata/type_metadata";

export interface InterfaceElementMeta extends BaseMetadata {
    shortcut?: string;
    related_features?: string[];
}

export type DocPayload = 
    | { type: "node"; data: NodeTypeMeta }
    | { type: "datatype"; data: DataTypeMeta }
    | { type: "interface"; data: InterfaceElementMeta }
;

export enum DocsPath {
    NODE = "nodetypes",
    DATATYPE = "datatypes",
    UI = "interface"
}