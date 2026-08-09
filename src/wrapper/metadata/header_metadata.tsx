import { BaseMetadata } from "./base_metadata"
import { NodeCategory, NodeTag, parse_category, parse_tag } from "./node_filters"
import { DataTypeMeta, NodeTypeMeta } from "./type_metadata"

export interface MetadataVersion {
    meta_version: number,
    types_version: number
}

export interface MetadataHeader extends MetadataVersion, BaseMetadata {
    types_id: string,
    last_modified: number,

    tags: Record<string, NodeTag>,
    categories: Record<string, NodeCategory>
}

export interface Metadata extends MetadataHeader {
    data_types: Record<string, DataTypeMeta>,
    node_types: Record<string, NodeTypeMeta>
}

export const parse_header = (json_data: any): MetadataHeader => {
    const tags_record: Record<string, NodeTag> = {};
    const categories_record: Record<string, NodeCategory> = {};

    for (const [id, data] of Object.entries(json_data.tags || {})) {
        tags_record[id] = parse_tag(id, data);
    }

    for (const [id, data] of Object.entries(json_data.categories || {})) {
        categories_record[id] = parse_category(id, data);
    }

    const header_meta: MetadataHeader = {
        capitalized_name: json_data.capitalized_name ?? json_data.types_id ?? "",
        description: json_data.description ?? "",
        types_version: json_data.types_version,
        meta_version: json_data.meta_version,
        types_id: json_data.types_id ?? "",
        last_modified: json_data.last_modified ?? 0,
        tags: tags_record,
        categories: categories_record
    };

    for (const category of Object.values(header_meta.categories)) {
        const parsed_tags: Array<NodeTag> = [];
        category.default_tags.forEach((tag) => {
            if (typeof tag === "string") {
                const tag_ref = header_meta.tags[tag];
                if (tag_ref) parsed_tags.push(tag_ref);
                return;
            }
            parsed_tags.push(tag);
        });
        category.default_tags = parsed_tags;

        if (typeof category.super_category === "string") {
            const super_cat_ref = header_meta.categories[category.super_category];
            if (super_cat_ref) category.super_category = super_cat_ref;
        }
    }

    return header_meta;
};