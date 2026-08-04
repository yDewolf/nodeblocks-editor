import { BaseMetadata } from "~/wrapper/metadata/base_metadata";
import { MetadataHeader } from "~/wrapper/metadata/header_metadata";
import { DataTypeMeta, NodeTypeMeta } from "~/wrapper/metadata/type_metadata";

export interface InterfaceElementMeta extends BaseMetadata {
    shortcut?: string;
    related_features?: string[];
}

export type DocPayload = 
    | { type: "node"; data: NodeTypeMeta }
    | { type: "datatype"; data: DataTypeMeta }
    | { type: "interface"; data: InterfaceElementMeta }
    // TODO: Implement header metadata stuff
    // | { type: "header"; data: MetadataHeader }
;

export enum DocsPath {
    NODE = "nodetypes",
    DATATYPE = "datatypes",
    UI = "interface"
}