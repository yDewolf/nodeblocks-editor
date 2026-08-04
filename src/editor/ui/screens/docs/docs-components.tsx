import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { createMemo, For, Match, Show, Switch } from 'solid-js';
import { NodeCategory, NodeTag } from "~/wrapper/metadata/node_filters";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import TagIcon from "~/assets/icons/tag.svg";
import { DocsPathSplitter } from "~/singletons/metadata";

type PathPart = {
    path: string[],
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

function recursive_category_part(category: NodeCategory | string, current_path: string[], path_parts: PathPart[]) {
    if (!category) {return;}
    if (typeof category === "string") {
        current_path = [...current_path, category];
        path_parts.push({
            path: current_path,
            label: category
        })
        return;
    }

    const categories = get_categories_recursive(category)
    categories.forEach((category) => {
        if (!category.category_id) return;
        current_path = [...current_path, category.category_id];
        path_parts.push({
            path: current_path,
            label: category.category_id
        });
    })
}


export const DocsPath = (props: {current_path?: string, docs_data?: DocPayload}) => {
    const path_parts = createMemo(() => {
        if (!props.current_path) {
            return [];
        }
        
        const path_split = props.current_path.split(DocsPathSplitter);
        if (path_split.length == 0) return [];
        
        const root_path = [path_split[0]] 
        let path_parts: PathPart[] = [{
            path: root_path,
            label: path_split[0]
        }];
        
        if (props.docs_data?.type === "node") {
            let current_path = root_path;
            const node_category = props.docs_data.data.category;
            recursive_category_part(node_category, current_path, path_parts);            
        }

        path_split.forEach((part, idx) => {
            if (idx == 0) return;
            const this_path = path_parts.filter((part, part_idx) => part_idx <= idx);
            
            let local_parts: string[] = [];
            this_path.forEach((path_part) => {
                local_parts.push(path_part.label);
            });
            local_parts.push(part);
            path_parts.push({
                path: local_parts,
                label: part
            })
        });
        return path_parts;
    })

    return (
        <div class="path-holder keep fill row-container">
            <For each={path_parts()}>
                {(part, idx) => {
                    return (
                        <>
                            {/* FIXME: this path generator. It includes categories that aren't parsed by DocsResolver */}
                            <a href={`#docs=${part.path.join(DocsPathSplitter)}`}>
                                <span>{part.label}</span>
                            </a>
                            <Switch>
                                <Match when={idx() < (path_parts()?.length ?? 1) - 1}>
                                    <span>
                                        {">"}
                                    </span>
                                </Match>
                            </Switch>
                        </>
                    )
                }}                        
            </For>
        </div>
    )
}

export const DocsTags = (props: {docs_data?: DocPayload, section_title?: string}) => {
    const data_tags = createMemo(() => {
        const data = props.docs_data;
        if (!data) return [];
        
        if (data.type === "node") {
            return get_node_tags(data.data);
        }

        if (data.type === "header") {
            return Object.values(data.data.tags);
        }

        return []
    });

    return (
        <Show when={data_tags().length > 0}>
            <div class="text-section">
                <h3>{props.section_title ?? "Tags"}</h3>
                <div class="tag-holder row-container keep fill">
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
