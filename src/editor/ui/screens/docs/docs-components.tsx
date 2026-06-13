import { createMemo, For, Show } from "solid-js";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { NodeCategory, NodeTag } from "~/wrapper/metadata/node_filters";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import TagIcon from "~/assets/icons/tag.svg";

type PathPart = {
    label: string,
}

function get_categories_recursive(category: NodeCategory | string) {
    if (typeof category === "string") {
        // TODO: grab categories from metadata I guess
        return [];
    }
    
    let categories: NodeCategory[] = [];
    if (category.super_category) {
        categories = [...get_categories_recursive(category.super_category), ...categories]
    }
    
    categories.push(category);
    return categories;
}

function get_node_tags(node: NodeTypeMeta) {
    let tags: Array<NodeTag | string> = [];
    if (node.category) {
        const categories = get_categories_recursive(node.category);
        categories.forEach((category) => {
            tags = [...category.default_tags, ...tags];
        })
    }

    tags = [...tags, ...node.tags];
    return tags
}

function recursive_category_part(category: NodeCategory | string, path_parts: PathPart[]) {
    if (!category) {return;}
    if (typeof category === "string") {
        path_parts.push({label: category})
        return;
    }

    const categories = get_categories_recursive(category)
    categories.forEach((category) => {
        if (!category.category_id) return;
        path_parts.push({
            label: category.category_id
        });
    })
}


export const DocsPath = (props: {current_path?: string, docs_data?: DocPayload}) => {
    const path_parts = createMemo(() => {
        if (!props.current_path) {
            return [];
        }
        
        const path_split = props.current_path.split("/");
        if (path_split.length == 0) return [];
        
        let path_parts: PathPart[] = [{
            label: path_split[0]
        }];
        
        if (props.docs_data?.type === "node") {
            const node_category = props.docs_data.data.category;
            recursive_category_part(node_category, path_parts);            
        }

        path_split.forEach((part, idx) => {
            if (idx == 0) return;
            path_parts.push({label: part})
        });
        return path_parts;
    })

    return (
        <div class="keep fill row-container">
            <For each={path_parts()}>
                {(part, idx) => {
                    return (
                        <span>{part.label + (idx() < (path_parts()?.length ?? 1) - 1 ? " > " : "")}</span>
                    )
                }}                        
            </For>
        </div>
    )
}

export const DocsTags = (props: {docs_data?: DocPayload}) => {
    const data_tags = createMemo(() => {
        const data = props.docs_data;
        if (!data) return [];
        
        if (data.type === "node") {
            return get_node_tags(data.data);
        }

        return []
    });

    return (
        <Show when={data_tags().length > 0}>
            <div class="keep fill container">
                <h3>Tags</h3>
                <div class="keep fill row-container">
                    <For each={data_tags()}>
                        {(tag, idx) => {
                            const tag_name = typeof tag === "string" ? tag : tag.tag_id;
                            return (
                                <div class="docs-tag">
                                    <TagIcon class="tag-icon"/>
                                    <span>{tag_name}</span>
                                </div>
                            )
                        }}
                    </For>
                </div>
            </div>
        </Show>
    )
}