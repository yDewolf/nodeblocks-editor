import { NodeCategory, NodeTag } from "./node_filters"
import { DataTypeMeta, NodeTypeMeta } from "./type_metadata"

export interface MetadataVersion {
    meta_version: number,
    types_version: number
}

export interface MetadataHeader extends MetadataVersion {
    types_id: string,
    last_modified: number,

    tags: Map<string, NodeTag>,
    categories: Map<string, NodeCategory>
}

export interface Metadata extends MetadataHeader {
    data_types: Map<string, DataTypeMeta>,
    node_types: Map<string, NodeTypeMeta>
}