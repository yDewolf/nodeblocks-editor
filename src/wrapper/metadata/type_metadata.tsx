import { BaseMetadata } from "./base_metadata";
import { NodeCategory, NodeTag } from "./node_filters";

export interface SlotMeta extends BaseMetadata {}
export interface ParameterMeta extends BaseMetadata {}

export interface NodeTypeMeta extends BaseMetadata {
    category: NodeCategory,
    tags: Array<NodeTag>,
    parameter_meta: Map<string, ParameterMeta>,
    slot_meta: Map<string, SlotMeta>
}

export interface DataTypeMeta extends BaseMetadata {
    
}