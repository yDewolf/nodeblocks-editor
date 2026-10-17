import { BaseMetadata } from "~/old/wrapper/metadata/base_metadata";
import { MetadataHeader } from "~/old/wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta } from "~/old/wrapper/metadata/type_metadata";

export interface InterfaceElementMeta extends BaseMetadata {
    shortcut?: string;
    related_features?: string[];
}

export type DocPayload = 
    | { type: "node"; data: NodeTypeMeta }
    | { type: "datatype"; data: DataTypeMeta }
    | { type: "interface"; data: InterfaceElementMeta }
    | { type: "header"; data: MetadataHeader }
;

export const DocsPathSplitter = ".";

export enum DocsPathPrefix {
    HEADER = "",
    NODE = "nodetypes",
    DATATYPE = "datatypes",
    UI = "interface"
}