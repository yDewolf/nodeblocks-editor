import { createMemo, mapArray, For, createSignal, Show, onCleanup } from "solid-js";
import { ensureScene } from "~/feature/scene/scene-context";
import { NodeTypePreview } from "./node-type-components";
import { Dropdown } from '../../../../../components/panels/dropdown';
import FilterIcon from '~/assets/icons/filter.svg';
import { useI18n } from "~/i18n/i18n-context";
import { SearchBar } from "~/components/search-bar";
import TagIcon from '~/assets/icons/tag.svg';
import CloseIcon from '~/assets/icons/close.svg';
import { usePackageManager } from "~/feature/editor/contexts/package-manager-context";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";

interface NodeTypeSearch {
    package_id: string
    type_id: string
    capitalized_name: string
    brief: string
}

export const NodeTypeSelector = (props: {
    onClickOnPreview: (node_preview: NodeTypePreview) => void
}) => {
    const packageManager = usePackageManager();
    // const [categoryFilter, setCategoryFilter] = createSignal<string | undefined>(undefined);
    const [specs, setSpecs] = createSignal<NodeTypeSpec[]>(
        Object.values(packageManager.registry.nodeTypes
    ));
    const unlisten = packageManager.subscribePackageLoad(() => {
        setSpecs(Object.values(packageManager.registry.nodeTypes));
    });
    onCleanup(() => unlisten);

    const node_previews = mapArray(specs, (spec) => {
        return new NodeTypePreview(spec);
    });

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
                    </div>
                    <Dropdown icon={<FilterIcon class="smaller-icon"/>}>

                    </Dropdown>
                </div>
            </div>
            <div class="node-type-selector">
                <For each={node_previews()}>
                    {(item) => item.View(props.onClickOnPreview)}
                </For>
            </div>
        </div>
    );
}
