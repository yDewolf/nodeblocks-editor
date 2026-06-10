export interface NodeTag {
    tag_id: string,
    description?: string
}

export interface NodeCategory {
    super_category?: NodeCategory | string,
    
    category_id: string,
    description: string,
    default_tags: Array<NodeTag | string> 
}

const SYSTEM_TYPE_TAG: NodeTag = {tag_id: "system"}
export const UNSET_CATEGORY: NodeCategory = {
    category_id: "Unknown",
    description: "Node doesn't have a category set",
    default_tags: [SYSTEM_TYPE_TAG,]
}

export const parse_tag = (id: string, json_data: any): NodeTag => {
    return { tag_id: id, description: json_data.description ?? "" }
}
export const parse_category = (id: string, json_data: any): NodeCategory => {
    return {
        category_id: id,
        description: json_data.description ?? "",
        default_tags: json_data.default_tags ?? [],
        super_category: json_data.super_category
    }; 
}