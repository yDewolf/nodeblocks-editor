import { createMemo, mapArray, For, createSignal, Show } from "solid-js";
import { ensureScene } from "~/feature/scene/scene-context";
import { NodeTypePreview } from "./node-type-components";
import { Dropdown } from '../../../../../components/panels/dropdown';
import FilterIcon from '~/assets/icons/filter.svg';
import { useI18n } from "~/i18n/i18n-context";
import { SearchBar } from "~/components/search-bar";
import TagIcon from '~/assets/icons/tag.svg';
import CloseIcon from '~/assets/icons/close.svg';

interface NodeTypeSearch {
    package_id: string
    type_id: string
    capitalized_name: string
    brief: string
}

export const NodeTypeSelector = (props: {
    onClickOnPreview: (node_preview: NodeTypePreview) => void
}) => {
    const scene = ensureScene();
    // const [categoryFilter, setCategoryFilter] = createSignal<string | undefined>(undefined);
    const specs = createMemo(() => {
        // TODO: usar o packageManager e as dependências da cena para
        // passar os specs dos nodes
        return Object.values(scene.scene.registry.nodeTypes);
    });

    // const categories = createMemo(() => {
    //     let category_index = new Map<string, NodeCategory>()
    //     constructors().forEach((constructor) => {
    //         const node_meta = metadata.get_node_meta(constructor.type_id, constructor.root_id);
    //         if (node_meta?.category) {
    //             if (typeof node_meta.category == "string") {
    //                 return;
    //             }

    //             category_index.set(
    //                 node_meta.category.category_id,
    //                 node_meta.category
    //             )
    //         }
    //     });

    //     return category_index;
    // });
    
    const node_previews = mapArray(specs, (spec) => {
        return new NodeTypePreview(spec);
    });
    // const filtered_previews = createMemo(() => {
    //     return node_previews().filter((preview) => {
    //         const category = metadata.get_node_meta(preview.node_constructor.type_id, preview.node_constructor.root_id)?.category;
    //         if (typeof category == "string") {
    //             return false;
    //         }
    //         return categoryFilter() === undefined || category?.category_id == categoryFilter()
    //     })
    // })

    const handleSearch = (query: string): NodeTypeSearch[] => {
        return [{
            package_id: "placeholder",
            type_id: "place",
            capitalized_name: "Placeholder",
            brief: "lorem ipsum"
        }]
    }

    return (
        <div class="node-type-selector-holder">
            <div class="container fill">
                {SearchBar<NodeTypeSearch>(
                    handleSearch,
                    (result, setQuery) => (
                        <div class="container fill">
                            <div class="row-container space-between center-items">
                                <span class="search-result-title">{result.capitalized_name}</span>
                                <span class="search-result-root">
                                    {result.type_id} ({result.package_id})
                                </span>
                            </div>
                            <Show when={result.brief}>
                                <p class="search-result-description">{result.brief}</p>
                            </Show>
                        </div>
                    )
                )}
                <div class="nodetype-filter-holder">
                    <div class="tag-filter-holder">
                        {/*  */}
                        <div class="tag-filter">
                            {/*  */}
                            <div class="keep row-container center-items">
                                <TagIcon class="tag-icon"/>
                                <span>place/holder</span>
                            </div>
                            <button class="icon-button" onclick={() => {
                                
                            }}>
                                <CloseIcon class="smaller-icon"/>
                            </button>
                        </div>


                        <div class="tag-filter">
                            <div class="keep row-container center-items">
                                <TagIcon class="tag-icon"/>
                                <span>place/holder</span>
                            </div>
                            <button class="icon-button" onclick={() => {
                                
                            }}>
                                <CloseIcon class="smaller-icon"/>
                            </button>
                        </div>
                        <div class="tag-filter">
                            <div class="keep row-container center-items">
                                <TagIcon class="tag-icon"/>
                                <span>place/holder</span>
                            </div>
                            <button class="icon-button" onclick={() => {
                                
                            }}>
                                <CloseIcon class="smaller-icon"/>
                            </button>
                        </div>

                        
                    </div>
                    <Dropdown icon={<FilterIcon class="smaller-icon"/>}>

                    </Dropdown>
                </div>
            </div>
            <div class="container fill" style={{"background-color": "red"}}>
                
            </div>
            {/* <div class="container fill" style={{color: "white"}}>
                <div class="keep row-container">
                    <h3>Categories</h3>
                </div>
                <div class="keep row-container scrollable" style={{width: "auto"}}>
                    <For each={categories().entries().toArray()}>
                        {([name, category]) => {
                            return <button 
                                class="selectable-button"
                                classList={{"active": categoryFilter() == name}}
                                onclick={() => setCategoryFilter(name)}
                            >
                                {name}
                            </button>
                        }}
                    </For>
                </div>
            </div> */}
            {/* <div class="keep fill row-container space-between" style={{"align-items": "center"}}>
                <h3>
                    {categoryFilter() ?? "All"} Nodes
                </h3>
                <Show when={categoryFilter() != undefined}>
                    <button class="icon-button" onclick={() => setCategoryFilter(undefined)}>
                        <CloseIcon />
                    </button>
                </Show>
            </div> */}
            {/* <div class="node-type-selector">
                <For each={node_previews()}>
                    {(item) => item.View(props.onClickOnPreview)}
                </For>
            </div> */}
        </div>
    );
}


export const NodeTypeSearchbar = () => {
    const { t } = useI18n();
    let containerRef: HTMLDivElement | undefined;
    const [query, setQuery] = createSignal("");
    const [isFocused, setIsFocused] = createSignal(false);

    const searchResults = createMemo(() => undefined);
    const handleOnFocusOut = (e: FocusEvent) => {
        const nextTarget = e.relatedTarget as Node
        if (!nextTarget || !containerRef?.contains(nextTarget)) {
            setIsFocused(false);
        }
    }

    return (
        <div 
            ref={containerRef}
            class="fill search-container" 
            onFocusOut={handleOnFocusOut}
        >
            <input
                onFocusOut={handleOnFocusOut}
                onfocusin={() => {
                    setIsFocused(true);
                }}
                class="fill search-bar"
                classList={{
                    "dropdown-visible": query().trim().length > 0
                }}
                type="text"
                placeholder={t("pages.docs.messages.searchForTopics")}
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
            />
            <Show when={query().trim().length > 0}>
                <div 
                    class="scrollable container search-results-dropdown"
                    classList={{
                        "unfocused": !isFocused()
                    }}
                >
                    {/* <For each={searchResults()} fallback={
                        <div>{t("pages.docs.messages.noTopicFound")}</div>
                    }>
                        {(topic) => (
                            
                        )}
                    </For> */}
                </div>
            </Show>
        </div>
    );
}