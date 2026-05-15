export interface NodeTag {
    tag_name: string,
    description?: string
}

export interface NodeCategory {
    super_category?: NodeCategory,
    name: string,
    description: string,
    default_tags: Array<NodeTag>
}

export interface NodeMetadata {
    category: NodeCategory,
    capitalized_type: string,
    tags: Array<NodeTag>
}

const SYSTEM_TYPE_TAG: NodeTag = {tag_name: "system"}
export const UNSET_CATEGORY: NodeCategory = {
    name: "Unknown",
    description: "Node doesn't have a category set",
    default_tags: [SYSTEM_TYPE_TAG,]
}