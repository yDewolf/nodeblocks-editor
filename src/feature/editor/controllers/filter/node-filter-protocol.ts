export type FilterTypes = "tag" | "category";

export type FilterViewMode = "active_filters" | "tags" | "categories";

export type ActiveFilterDisplayMode = "by_plugin" | "all";
export type NodeSpecSortMode = "id" | "recent";

export const ACTIVE_FILTER_DISPLAY_MODES = ["by_plugin", "all"];
export const NODE_SPEC_SORT_MODES = ["id", "recent"];

export interface ActiveFilterItem {
    packageId: string;
    type: FilterTypes;
    id: string;
    label: string;
}


export interface NodeFilterState {
    view: FilterViewMode;
    activeFilterDisplayMode: ActiveFilterDisplayMode;
    specSortMode: NodeSpecSortMode;
    isCrescentOrder: boolean;

    selectedPackageId: string | null;

    // {packageId}:{type}:{id} -> ActiveFilterItem
    activeFilters: Record<string, ActiveFilterItem>;
    recentNodeFqns: string[];
}


export function makeNodeFilterKey(packageId: string, type: FilterTypes, id: string): string {
    return `${packageId}:${type}:${id}`;
}

export const createDefaultNodeFilterState = (): NodeFilterState => ({
    view: "active_filters",
    selectedPackageId: null,
    specSortMode: "id",
    isCrescentOrder: true,
    activeFilterDisplayMode: "by_plugin",
    activeFilters: {},
    recentNodeFqns: []
});

