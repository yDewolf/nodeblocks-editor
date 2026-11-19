import { createMemo, mapArray, For, createSignal, Show, onCleanup, createEffect, Switch, Match } from "solid-js";
import { NodeTypePreview } from "./node-type-components";
import { Dropdown, DropdownSection, DropsideItemData, DropsideManager } from '../../../../../components/panels/dropdown';
import FilterIcon from '~/assets/icons/filter.svg';
import { useI18n } from "~/i18n/i18n-context";
import { SearchBar } from "~/components/search-bar";
import { usePackageManager } from "~/feature/editor/contexts/package-manager-context";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { useMetadata } from "~/feature/metadata/metadata-context";
import { NodeFilterController } from "~/feature/editor/controllers/filter/node-filter-controller";
import { ensureNodeFilters } from "~/feature/editor/contexts/node-filter-context";
import { ACTIVE_FILTER_DISPLAY_MODES, ActiveFilterDisplayMode } from "~/feature/editor/controllers/filter/node-filter-protocol";
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

    const filterController = ensureNodeFilters();
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
                    <div class="row-container active-filters">
                        {/* TODO: aqui acho que ficaria melhor se ele mostrasse*/}
                        {/* a quantidade de filtros de tags ou categorias*/}
                        <For each={filterController.activeFiltersList}>
                            {(filter) => (
                                <NodeTypeFilter
                                    label={`${filter.packageId}/${filter.label}`}
                                    isActive={true}
                                    activate={() => {}}
                                    deactivate={() => filterController.deactivateFilter(filter.packageId, filter.type, filter.id)}
                                />
                            )}
                        </For>
                    </div>
                    <NodeFilterDropdown />
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


const PackageNavigator = (props: {
    controller: NodeFilterController,
    onNavigate?: () => void
}) => {
    const metadata = useMetadata();
    const packageManager = usePackageManager();
    const [currentItem, setCurrentItem] = createSignal<string | undefined>(undefined);
    
    const [dropsides, setDropsides] = createSignal<Map<string, DropsideItemData>>(new Map());
    const prepareDropsides = () => {
        const nextMap = new Map<string, DropsideItemData>();
        for (const [package_id] of Object.entries(packageManager.getAllPackages())) {
            const meta = metadata?.get_header(package_id);
            nextMap.set(package_id, {
                label: package_id,
                dropsideClass: "plugin-select-dropside",
                content: () => (
                    <div class="container">
                        <button
                            class="text-button"
                            onclick={() => {
                                props.controller.openPackageTags(package_id);
                                setCurrentItem(undefined);
                                props.onNavigate?.();
                            }}
                        >
                            Tags ({Object.keys(meta?.tags ?? {}).length})
                        </button>
                        <button
                            class="text-button"
                            onclick={() => {
                                props.controller.openPackageCategories(package_id);
                                setCurrentItem(undefined);
                                props.onNavigate?.();
                            }}
                        >
                            Categories ({Object.keys(meta?.categories ?? {}).length})
                        </button>
                    </div>
                ),
            });
        }
        setDropsides(nextMap);
    };
    
    const unlisten = packageManager.subscribePackageLoad(() => {
        prepareDropsides();
    });
    onCleanup(() => unlisten);

    prepareDropsides();
    
    return (
        <DropsideManager dropsides={dropsides()} closeOnMouseOut={true} currentItem={currentItem} setCurrentItem={setCurrentItem}>
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

const NodeFilterDropdown = () => {
    const metadata = useMetadata();
    const filterController = ensureNodeFilters();
    const currentPackageItems = createMemo(() => {
        const pkgId = filterController.selectedPackageId;
        const view = filterController.currentView;
        if (!pkgId || view == "active_filters") return [];

        const meta = metadata?.get_header(pkgId);
        if (!meta) return [];

        const source = view == "tags" ? meta.tags : meta.categories;
        if (!source) return [];

        return Object.entries(source).map(([id, data]) => ({
            id,
            label: typeof data === "string" ? data : (
                data.capitalized_name ?? id
            ),
        }));
    });

    const packageManager = usePackageManager();
    const [packageIds, setPackageIds] = createSignal<string[]>(
        Object.keys(packageManager.getAllPackages())
    );
    const unlisten = packageManager.subscribePackageLoad(() => {
        setPackageIds(Object.keys(packageManager.getAllPackages()));
    });
    onCleanup(() => unlisten);

    return <Dropdown icon={<FilterIcon class="smaller-icon"/>}>
        <div class="filter-dropdown">
            <div class="filter-dropdown-header row-container fill">
                <Show when={filterController.canGoBack}>
                    <button class="icon-button" onclick={() => {
                        if (filterController.canGoBack) {
                            filterController.goBack();
                        }
                    }}>
                        {"<"}
                    </button>
                </Show>
                <div class="row-container fill center-items">
                    <span>Node Type Filters</span>
                    |
                    <span class="node-type-filter-path">
                        {filterController.currentPath.join(" -> ")}
                    </span>
                </div>
            </div>
            <div class="filter-dropdown-body">
                <div class="plugin-selector">
                    <PackageNavigator controller={filterController}/>
                </div>
                <div class="filter-dropdown-content container">
                    {/* TODO: Tradução */}
                    <div class="keep row-container fill center-items space-between">
                        <span><b>{filterController.currentSection}</b></span>
                        <Show when={filterController.currentView == "active_filters"}>
                            <select 
                                value={filterController.state.activeFilterDisplayMode}
                                oninput={(e) => {
                                    filterController.setDisplayMode(e.target.value as ActiveFilterDisplayMode)
                                }
                            }>
                                <For each={ACTIVE_FILTER_DISPLAY_MODES}>
                                    {(mode) => <option value={mode}>
                                        {/* TODO: translate */}
                                        {mode}
                                    </option>}
                                </For>
                            </select>
                        </Show>
                    </div>
                    <Show when={filterController.currentView == "active_filters"} fallback={
                        <div class="active-filters">
                            <For each={currentPackageItems()} fallback={
                                <span class="node-type-filter-path">No item found</span>
                            }>
                                {(item) => {
                                    const pkgId = filterController.selectedPackageId!;
                                    const type = filterController.currentView === "tags" ? "tag" : "category";
                                    return (
                                        <NodeTypeFilter
                                            label={item.label}
                                            isActive={filterController.isFilterActive(pkgId, type, item.id)}
                                            activate={() => filterController.activateFilter({
                                                packageId: pkgId,
                                                type,
                                                id: item.id,
                                                label: item.label,
                                            })}
                                            deactivate={() => filterController.deactivateFilter(pkgId, type, item.id)}
                                        />
                                    );
                                }}
                            </For>
                        </div>
                    }>
                        <Show when={filterController.activeFiltersList.length > 0} fallback={
                            <span class="node-type-filter-path">No active filters</span>
                        }>
                            <Switch fallback={
                                // Show all
                                <div class="active-filters">
                                    <For each={filterController.activeFiltersList} fallback={
                                        <span class="node-type-filter-path">No active filter</span>
                                    }>
                                        {(filter) => <NodeTypeFilter
                                            label={`${filter.packageId}: ${filter.label}`}
                                            isActive={true}
                                            activate={() => {}}
                                            deactivate={() => filterController.deactivateFilter(filter.packageId, filter.type, filter.id)}
                                        />}
                                    </For>
                                </div>
                            }>
                                <Match when={filterController.state.activeFilterDisplayMode == "by_plugin"}>
                                    <For each={packageIds()}>
                                        {(packageId) => <Show when={filterController.getPackageActiveFilters(packageId).length > 0}>
                                            <div class="text-section package-filter-section">
                                                <span>{packageId}</span>
                                                <div class="active-filters">
                                                    <For each={filterController.getPackageActiveFilters(packageId)}>
                                                        {(filter) => <NodeTypeFilter
                                                            label={filter.label}
                                                            isActive={true}
                                                            activate={() => {}}
                                                            deactivate={() => filterController.deactivateFilter(filter.packageId, filter.type, filter.id)}
                                                        />}
                                                    </For>
                                                </div>
                                            </div>
                                        </Show>}
                                    </For>
                                </Match>
                            </Switch>
                        </Show>
                    </Show>
                </div>
            </div>
        </div>
    </Dropdown>;
}
