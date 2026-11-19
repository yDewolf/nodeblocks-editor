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
import { ActiveFilterItem, NODE_SPEC_SORT_MODES, NodeSpecSortMode } from "~/feature/editor/controllers/filter/node-filter-protocol";
import { ensureNodeFilters } from "~/feature/editor/contexts/node-filter-context";
import { ACTIVE_FILTER_DISPLAY_MODES, ActiveFilterDisplayMode } from "~/feature/editor/controllers/filter/node-filter-protocol";
import { NodeTypeSearch } from "~/feature/editor/controllers/filter/node-search-helper";
import LongArrowDownIcon from "~/assets/icons/long-arrow-down.svg";
import CloseIcon from '~/assets/icons/close.svg';
import ArrowRightIcon from '~/assets/icons/arrow-right.svg';

export const NodeTypeSelector = (props: {
    onClickOnPreview: (node_preview: NodeTypePreview) => void
}) => {
    const {t} = useI18n();
    const metadata = useMetadata();
    const packageManager = usePackageManager();
    const {filterController, searchSpec, searchNode} = ensureNodeFilters();
    // const [categoryFilter, setCategoryFilter] = createSignal<string | undefined>(undefined);

    const [specs, setSpecs] = createSignal<NodeTypeSpec[]>(
        Object.values(packageManager.registry.nodeTypes)
    );
    const [filteredFqns, setFilteredFqns] = createSignal<Set<string>>(new Set());
    const unlisten = packageManager.subscribePackageLoad(() => {
        setSpecs(Object.values(packageManager.registry.nodeTypes));
    });
    onCleanup(() => unlisten);

    
    const handleSearch = (query: string): NodeTypeSearch[] => {
        const results = searchNode(query);
        let fqns: Set<string> = new Set();
        for (const result of results) {
            fqns.add(result.fqn);
        }
        setFilteredFqns(fqns);
        return results;
    }
    
    const filtered_specs = createMemo(() => {
        if (!metadata) return specs(); 
        
        const filtersAndQuery = filterController.filterNodeSpecs(specs(), metadata).filter((spec) => 
            filteredFqns().size > 0 ? filteredFqns().has(spec.fqn) : true
        );
        if (filtersAndQuery.length > 0) return filtersAndQuery;

        // Filter only using query
        return specs().filter((spec) => 
            filteredFqns().size > 0 ? filteredFqns().has(spec.fqn) : true
        );
    });

    const sortSpecs = (a: NodeTypeSpec, b: NodeTypeSpec) => {
        if (filterController.state.specSortMode == "recent") {
            return (
                filterController.state.recentNodeFqns.findIndex((v) => v == b.fqn)
                - filterController.state.recentNodeFqns.findIndex((v) => v == a.fqn)
            ) * (filterController.state.isCrescentOrder ? 1 : -1);
        }
        return ('' + a.id).localeCompare(b.id) * (filterController.state.isCrescentOrder ? 1 : -1);
    }

    const node_previews = mapArray(() => filtered_specs().sort(sortSpecs), (spec) => {
        return new NodeTypePreview(spec);
    });

    const handleOnClickPreview = (node_preview: NodeTypePreview) => {
        props.onClickOnPreview(node_preview);
        filterController.addFqnToRecent(node_preview.spec.fqn);
    }

    return (
        <div class="node-type-selector-holder">
            <div class="container fill">
                <SearchBar<NodeTypeSearch>
                    search={handleSearch}
                    searchResultComponent={(result, setQuery) => (
                        <button class="node-search-result" onclick={() => setQuery(result.id)}>
                            <div class="container fill">
                                <div class="row-container space-between center-items">
                                    <span class="search-result-title">{result.capitalized_name}</span>
                                    <span class="search-result-root">
                                        {result.id} ({result.package_id})
                                    </span>
                                </div>
                                <Show when={result.brief}>
                                    <p class="search-result-description">{result.brief}</p>
                                </Show>
                            </div>
                        </button>
                    )}
                    searchPlaceholder={t("components.nodeTypeSelector.searchPlaceholder")}
                />
                <div class="nodetype-filter-holder center-items">
                    <div class="row-container">
                        <ClearActiveFiltersButton />
                    </div>
                    <div class="keep row-container center-items">
                        <NodeSpecSortModeSelector/>
                        <NodeFilterDropdown />
                    </div>
                </div>
            </div>
            <div class="node-type-selector">
                <For each={node_previews()}>
                    {(item) => item.View(handleOnClickPreview)}
                </For>
            </div>
        </div>
    );
}

// -- selector components

const PackageNavigator = (props: {
    controller: NodeFilterController,
    onNavigate?: () => void
}) => {
    const {t} = useI18n();
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
                            {t("words.tags")} ({Object.keys(meta?.tags ?? {}).length})
                        </button>
                        <button
                            class="text-button"
                            onclick={() => {
                                props.controller.openPackageCategories(package_id);
                                setCurrentItem(undefined);
                                props.onNavigate?.();
                            }}
                        >
                            {t("words.category", true)} ({Object.keys(meta?.categories ?? {}).length})
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
    title?: string
    filter: ActiveFilterItem
    isActive: boolean
    activate: () => void
    deactivate: () => void
}) => {
    return (
        <button
            // TODO: seria interessante poder selecionar as tags e ver a descrição delas 
            // docs-prefix={DocsPathPrefix.HEADER}
            // docs-id={props.filter.packageId}
            title={props.title ?? props.filter.label}
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
            {props.filter.label}
        </button>
    )
}

const NodeFilterDropdown = () => {
    const {t} = useI18n();
    const metadata = useMetadata();
    const { filterController } = ensureNodeFilters();
    const currentPackageItems = createMemo<ActiveFilterItem[]>(() => {
        const pkgId = filterController.selectedPackageId;
        const view = filterController.currentView;
        if (!pkgId || view == "active_filters") return [];

        const meta = metadata?.get_header(pkgId);
        if (!meta) return [];

        const source = view == "tags" ? meta.tags : meta.categories;
        if (!source) return [];

        return Object.entries(source).map(([id, data]) => ({
            id,
            type: view == "tags" ? "tag" : "category",
            label: typeof data === "string" ? data : (
                data.capitalized_name ?? id
            ),
            packageId: pkgId
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
                <div class="row-container fill center-items">
                    <span>{t("components.nodeTypeSelector.nodeTypeFilters")}</span>
                    |
                    <span class="node-type-filter-path">
                        {filterController.currentPath.join(" > ")}
                    </span>
                </div>
            </div>
            <div class="filter-dropdown-body">
                <div class="plugin-selector">
                    <PackageNavigator controller={filterController}/>
                </div>
                <div class="filter-dropdown-content container">
                    <div class="keep row-container fill center-items space-between">
                        <div class="row-container center-items">
                            <Show when={filterController.canGoBack}>
                                <button class="icon-button" onclick={() => {
                                    if (filterController.canGoBack) {
                                        filterController.goBack();
                                    }
                                }}>
                                    <ArrowRightIcon class="smaller-icon flip"/>
                                </button>
                            </Show>
                            <span><b>{t(`components.nodeTypeSelector.views.${filterController.currentSection}`)}</b></span>
                        </div>
                        <Show when={filterController.currentView == "active_filters"}>
                            <FilterDisplayModeSelector/>
                        </Show>
                    </div>
                    <Show when={filterController.currentView == "active_filters"} fallback={
                        <div class="active-filters">
                            <For each={currentPackageItems()} fallback={
                                <span class="node-type-filter-path">{t("messages.noSomethingFound", t("words.filter"))}</span>
                            }>
                                {(filter) => {
                                    const pkgId = filterController.selectedPackageId!;
                                    const type = filterController.currentView === "tags" ? "tag" : "category";
                                    return (
                                        <NodeTypeFilter
                                            filter={filter}
                                            isActive={filterController.isFilterActive(pkgId, type, filter.id)}
                                            activate={() => filterController.activateFilter(filter)}
                                            deactivate={() => filterController.deactivateFilter(pkgId, type, filter.id)}
                                        />
                                    );
                                }}
                            </For>
                        </div>
                    }>
                        <Show when={filterController.activeFiltersList.length > 0} fallback={
                            <span class="node-type-filter-path">{t("components.nodeTypeSelector.messages.noActiveFilters")}</span>
                        }>
                            <Switch fallback={
                                // Show all
                                <div class="active-filters">
                                    <For each={filterController.activeFiltersList} fallback={
                                        <span class="node-type-filter-path">{t("components.nodeTypeSelector.messages.noActiveFilters")}</span>
                                    }>
                                        {(filter) => <NodeTypeFilter
                                            filter={filter}
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
                                                            filter={filter}
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


export const ClearActiveFiltersButton = () => {
    const {t} = useI18n();
    const { filterController } = ensureNodeFilters();
    return (
        <Show when={filterController.activeFiltersList.length > 0}>
            <div class="filter-counter row-container center-items">
                {filterController.activeFiltersList.length} {t("words.filter", filterController.activeFiltersList.length > 1)}
                <button class="icon-button" onclick={() => {
                    filterController.clearActiveFilters();  
                }}>
                    <CloseIcon class="smaller-icon"/>
                </button>
            </div>
        </Show>
    )
}

export const NodeSpecSortModeSelector = () => {
    const {t} = useI18n();
    const {filterController} = ensureNodeFilters();
    return (
        <div class="keep row-container center-items">
            <button class="icon-button" onclick={() => {
                filterController.setCrescentOrder(!filterController.state.isCrescentOrder);
            }}>
                <LongArrowDownIcon class="smaller-icon" classList={{"y-flip": !filterController.state.isCrescentOrder}}/>
            </button>
            <select value={filterController.state.specSortMode} oninput={(e) => {
                filterController.setSortMode(e.target.value as NodeSpecSortMode)
            }} id="type-selector-order">
                <For each={NODE_SPEC_SORT_MODES}>
                    {(mode) => <option value={mode}>
                        {t(`components.nodeTypeSelector.sortModes.${mode as NodeSpecSortMode}`)}
                    </option>}
                </For>
            </select>
        </div>
    )
}

export const FilterDisplayModeSelector = () => {
    const {t} = useI18n();
    const {filterController} = ensureNodeFilters();

    return (
        <select 
            value={filterController.state.activeFilterDisplayMode}
            oninput={(e) => {
                filterController.setDisplayMode(e.target.value as ActiveFilterDisplayMode)
            }
        }>
            <For each={ACTIVE_FILTER_DISPLAY_MODES}>
                {(mode) => <option value={mode}>
                    {t(`components.nodeTypeSelector.displayModes.${mode as ActiveFilterDisplayMode}`)}
                </option>}
            </For>
        </select>
    )
}