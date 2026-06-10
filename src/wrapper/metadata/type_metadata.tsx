import { BaseMetadata } from "./base_metadata";
import { NodeCategory, NodeTag } from "./node_filters";

export interface SlotMeta extends BaseMetadata {}
export interface ParameterMeta extends BaseMetadata {}

export interface NodeTypeMeta extends BaseMetadata {
    category: NodeCategory | string,
    tags: Array<NodeTag | string>,
    parameter_meta: Record<string, ParameterMeta>,
    slot_meta: Record<string, SlotMeta>
}

export interface DataTypeMeta extends BaseMetadata {
    
}

export const parse_node_types = (
    json_data: any, 
    parsed_tags: Record<string, NodeTag>, 
    parsed_categories: Record<string, NodeCategory>
): Record<string, NodeTypeMeta> => {
    const node_types_record: Record<string, NodeTypeMeta> = {};
    
    for (const [id, data] of Object.entries(json_data || {})) {
        node_types_record[id] = parse_node_type(id, data, parsed_tags, parsed_categories);
    }
    
    return node_types_record;
};

export const parse_node_type = (
    id: string, 
    json_data: any, 
    parsed_tags: Record<string, NodeTag>, 
    parsed_categories: Record<string, NodeCategory>
): NodeTypeMeta => {
    const parameter_meta: Record<string, ParameterMeta> = {};
    for (const [id, param_data] of Object.entries(json_data.parameter_meta || {})) {
        const data = param_data as any;
        parameter_meta[id] = {
            capitalized_name: data.capitalized_name ?? id,
            description: data.description ?? ""
        };
    }

    const slot_meta: Record<string, SlotMeta> = {};
    for (const [id, slot_data] of Object.entries(json_data.slot_meta || {})) {
        const data = slot_data as any;
        slot_meta[id] = {
            capitalized_name: data.capitalized_name ?? id,
            description: data.description ?? ""
        };
    }

    const node_meta: NodeTypeMeta = {
        capitalized_name: json_data.capitalized_name ?? id,
        description: json_data.description ?? "",
        category: json_data.category,
        tags: json_data.tags ?? [],
        parameter_meta,
        slot_meta
    };

    if (typeof node_meta.category === "string") {
        const parsed_category = parsed_categories[node_meta.category];
        if (parsed_category) {
            node_meta.category = parsed_category;
        }
    }
    
    const node_tags: Array<NodeTag> = [];
    node_meta.tags.forEach((tag) => {
        if (typeof tag === "string") {
            const parsed_tag = parsed_tags[tag];
            if (parsed_tag) node_tags.push(parsed_tag);
            return;
        }
        node_tags.push(tag);
    });
    node_meta.tags = node_tags;
    return node_meta;
};

export const parse_data_types = (json_data: any): Record<string, DataTypeMeta> => {
    const data_types_record: Record<string, DataTypeMeta> = {};
    for (const [id, data] of Object.entries(json_data || {})) {
        const datatype_data = data as any;
        data_types_record[id] = {
            capitalized_name: datatype_data.capitalized_name ?? id,
            description: datatype_data.description ?? ""
        };
    }
    
    return data_types_record;
};