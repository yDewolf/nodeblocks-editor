export interface NodeTag {
    tag_id: string,
    description?: string
}

export interface NodeCategory {
    super_category?: NodeCategory,
    
    category_id: string,
    description: string,
    default_tags: Array<NodeTag>
}

const SYSTEM_TYPE_TAG: NodeTag = {tag_id: "system"}
export const UNSET_CATEGORY: NodeCategory = {
    category_id: "Unknown",
    description: "Node doesn't have a category set",
    default_tags: [SYSTEM_TYPE_TAG,]
}