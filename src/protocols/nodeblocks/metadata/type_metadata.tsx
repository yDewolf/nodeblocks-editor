import { BaseMetadata, EngineSpecMetadata, RGBColor } from "./base_metadata";
import { MetaCategory, MetaTag } from "./node_filters";

export interface SlotMeta extends EngineSpecMetadata {}
export interface ParameterMeta extends EngineSpecMetadata {}

export interface NodeTypeMeta extends EngineSpecMetadata {
    category: MetaCategory | string,
    tags: Array<MetaTag | string>,
    parameter_meta: Record<string, ParameterMeta>,
    slot_meta: Record<string, SlotMeta>
}

export interface DataTypeStyle {
    color?: RGBColor
    backgroundColor?: RGBColor
}

export interface DataTypeMeta extends EngineSpecMetadata {
    is_builtin?: boolean

    inStyle?: DataTypeStyle
    outStyle?: DataTypeStyle
}

export const parse_node_types = (
    json_data: any, 
    parsed_tags: Record<string, MetaTag>, 
    parsed_categories: Record<string, MetaCategory>
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
    parsed_tags: Record<string, MetaTag>, 
    parsed_categories: Record<string, MetaCategory>
): NodeTypeMeta => {
    const parameter_meta: Record<string, ParameterMeta> = {};
    for (const [id, param_data] of Object.entries(json_data.parameter_meta || {})) {
        const data = param_data as any;
        parameter_meta[id] = {
            capitalized_name: data.capitalized_name ?? id,
            usages: data.usages ?? [],
            brief: data.brief ?? "",
            description: data.description ?? ""
        };
    }

    const slot_meta: Record<string, SlotMeta> = {};
    for (const [id, slot_data] of Object.entries(json_data.slot_meta || {})) {
        const data = slot_data as any;
        slot_meta[id] = {
            capitalized_name: data.capitalized_name ?? id,
            usages: data.usages ?? [],
            brief: data.brief ?? "",
            description: data.description ?? ""
        };
    }

    const node_meta: NodeTypeMeta = {
        capitalized_name: json_data.capitalized_name ?? id,
        description: json_data.description ?? "",
        brief: json_data.brief ?? "",
        category: json_data.category,
        tags: json_data.tags ?? [],
        usages: json_data.usages ?? [],
        parameter_meta,
        slot_meta
    };

    if (typeof node_meta.category === "string") {
        const parsed_category = parsed_categories[node_meta.category];
        if (parsed_category) {
            node_meta.category = parsed_category;
        }
    }
    
    const node_tags: Array<MetaTag> = [];
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
            brief: datatype_data.brief ?? "",
            usages: datatype_data.usages ?? [],
            description: datatype_data.description ?? "",
            inStyle: datatype_data.inStyle,
            outStyle: datatype_data.outStyle
        };
    }
    
    return data_types_record;
};