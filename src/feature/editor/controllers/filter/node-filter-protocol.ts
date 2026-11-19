import { FilterViewMode, ActiveFilterItem } from "./node-filter-controller";


export type FilterTypes = "tag" | "category";

export interface NodeFilterState {
    view: FilterViewMode;
    selectedPackageId: string | null;

    // {packageId}:{type}:{id} -> ActiveFilterItem
    activeFilters: Record<string, ActiveFilterItem>;
}

export function makeNodeFilterKey(packageId: string, type: FilterTypes, id: string): string {
    return `${packageId}:${type}:${id}`;
}

export const createDefaultNodeFilterState = (): NodeFilterState => ({
    view: "active_filters",
    selectedPackageId: null,
    activeFilters: {},
});