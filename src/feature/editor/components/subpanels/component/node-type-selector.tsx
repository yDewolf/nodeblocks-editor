import { createMemo, mapArray, For, createSignal, Show, onCleanup, createEffect } from "solid-js";
import { NodeTypePreview } from "./node-type-components";
import { Dropdown, DropdownSection, DropsideItemData, DropsideManager } from '../../../../../components/panels/dropdown';
import FilterIcon from '~/assets/icons/filter.svg';
import { useI18n } from "~/i18n/i18n-context";
import { SearchBar } from "~/components/search-bar";
import TagIcon from '~/assets/icons/tag.svg';
import CloseIcon from '~/assets/icons/close.svg';
import { usePackageManager } from "~/feature/editor/contexts/package-manager-context";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { useDocs } from "~/feature/docs/docs-context";
import { useMetadata } from "~/feature/metadata/metadata-context";
import { BooleanParam } from "~/protocols/nodeblocks/manifests/node/datatype-spec";

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
                <div class="nodetype-filter-holder center-items">
                    <div class="row-container">
                        <NodeTypeFilter 
                            label="test" 
                            isActive={true} 
                            activate={() => {}}
                            deactivate={() => {}}
                        />
                    </div>
                    <Dropdown icon={<FilterIcon class="smaller-icon"/>}>
                        <div class="filter-dropdown">
                            <div class="filter-dropdown-header row-container fill">
                                <button class="icon-button" onclick={() => {
                                    // TODO: voltar uma 'página'
                                }}>
                                    {"<"}
                                </button>
                                <div class="row-container fill center-items">
                                    <span>Node Type Filters</span>
                                    |
                                    <span class="node-type-filter-path">
                                        {/* current filter path. Example: packages -> mypackages -> tags */}
                                        packages
                                    </span>
                                </div>
                            </div>
                            <div class="filter-dropdown-body">
                                <div class="plugin-selector">
                                    <PackageNavigator/>
                                </div>
                                <div class="fill container">
                                    Active Filters
                                    <div class="active-filters">
                                        <NodeTypeFilter 
                                            label="test" 
                                            isActive={true} 
                                            activate={() => {}}
                                            deactivate={() => {}}
                                        />
                                    </div>
                                    {/* TODO: mostrar os filtros ativos aqui */}
                                </div>
                            </div>
                        </div>
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


const PackageNavigator = () => {
    const metadata = useMetadata();
    const packageManager = usePackageManager();
    let dropsides: Map<string, DropsideItemData> = new Map();
    const prepareDropsides = () => {
        for (const [package_id, pack] of Object.entries(packageManager.getAllPackages())) {
            const meta = metadata?.get_header(package_id);
            dropsides.set(package_id, {
                label: package_id,
                dropsideClass: "plugin-select-dropside",
                content: () => <div class="container">
                    <button class="text-button" onclick={() => {
                        // go to this package's tag list
                    }}>
                        Tags ({Object.keys(meta?.tags ?? {}).length})
                    </button>
                    <button class="text-button" onclick={() => {
                        // go to this package's category list
                    }}>
                        Categories ({Object.keys(meta?.categories ?? {}).length})
                    </button>
                </div>
            })
        }
    }
    
    const unlisten = packageManager.subscribePackageLoad(() => {
        prepareDropsides();
    });
    onCleanup(() => unlisten);

    prepareDropsides();
    return (
        <DropsideManager dropsides={dropsides} closeOnMouseOut={true}>
            {/* FIXME: responsivity */}
        </DropsideManager>
    )
}

const NodeTypeFilter = (props: {
    label: string
    isActive: boolean
    activate: () => void
    deactivate: () => void
}) => {
    return (
        <button 
            class="nodetype-filter keep row-container center-items" 
            classList={{active: props.isActive}}
            onclick={() => {
                if (!props.isActive) {
                    props.activate();
                    return;
                }
                props.deactivate();
            }}
        >
            {props.label}
        </button>
    )
}