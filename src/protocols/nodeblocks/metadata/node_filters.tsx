import { RGBColor } from "./base_metadata"

// TODO: rename this file to meta_filters

export interface MetaTag {
    tag_id: string,
    description?: string
}

export interface MetaCategory {
    super_category?: MetaCategory | string,
    
    category_id: string,
    description: string,
    default_tags: Array<MetaTag | string> 
    
    color?: RGBColor
}

const SYSTEM_TYPE_TAG: MetaTag = {tag_id: "system"}
export const UNSET_CATEGORY: MetaCategory = {
    category_id: "Unknown",
    description: "Node doesn't have a category set",
    default_tags: [SYSTEM_TYPE_TAG,]
}

export const parse_tag = (id: string, json_data: any): MetaTag => {
    return { tag_id: id, description: json_data.description ?? "" }
}
export const parse_category = (id: string, json_data: any): MetaCategory => {
    return {
        category_id: id,
        description: json_data.description ?? "",
        default_tags: json_data.default_tags ?? [],
        super_category: json_data.super_category,
        color: json_data.color
    }; 
}