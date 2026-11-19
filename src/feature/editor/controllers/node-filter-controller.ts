import { createStore } from "solid-js/store";

export type FilterViewMode = "active_filters" | "tags" | "categories";
export type FilterTypes = "tag" | "category";

export interface ActiveFilterItem {
    packageId: string;
    type: FilterTypes;
    id: string;
    label: string;
}

interface FilterState {
    view: FilterViewMode;
    selectedPackageId: string | null;

    // {packageId}:{type}:{id} -> ActiveFilterItem
    activeFilters: Record<string, ActiveFilterItem>;
}

// TODO: context provider e salvar o store de um desses por cena
export class NodeFilterController {
    private state: FilterState;
    private setState: ReturnType<typeof createStore<FilterState>>[1];

    constructor() {
        [this.state, this.setState] = createStore<FilterState>({
            view: "active_filters",
            selectedPackageId: null,
            activeFilters: {},
        });
    }

    // TODO: getFilteredNodes baseado nos filtros ativos
    get currentView(): FilterViewMode { return this.state.view; }
    get selectedPackageId(): string | null { return this.state.selectedPackageId; }
    get canGoBack(): boolean { return this.state.view !== "active_filters"; }
    get currentSection(): string { return this.state.view; }
    get currentPath(): string[] {
        return ["packages"].concat((this.state.selectedPackageId 
            ? [this.state.selectedPackageId, this.state.view] : [])
        );
    }

    get activeFiltersList(): ActiveFilterItem[] {
        return Object.values(this.state.activeFilters);
    }


    public openPackageTags(packageId: string) {
        this.setState({
            view: "tags",
            selectedPackageId: packageId,
        });
    }

    public openPackageCategories(packageId: string) {
        this.setState({
            view: "categories",
            selectedPackageId: packageId,
        });
    }

    public goBack() {
        this.setState({
            view: "active_filters",
            selectedPackageId: null,
        });
    }


    public isFilterActive(packageId: string, type: FilterTypes, id: string): boolean {
        return Boolean(this.state.activeFilters[this.makeKey(packageId, type, id)]);
    }

    public activateFilter(item: ActiveFilterItem) {
        const key = this.makeKey(item.packageId, item.type, item.id);
        this.setState("activeFilters", key, item);
    }

    public deactivateFilter(packageId: string, type: FilterTypes, id: string) {
        const key = this.makeKey(packageId, type, id);
        this.setState("activeFilters", key, undefined!);
    }

    // -- utils

    private makeKey(packageId: string, type: FilterTypes, id: string): string {
        return `${packageId}:${type}:${id}`;
    }
}