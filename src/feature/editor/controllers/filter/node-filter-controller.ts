import { createStore, SetStoreFunction } from "solid-js/store";
import { createDefaultNodeFilterState, FilterTypes, makeNodeFilterKey, NodeFilterState } from "./node-filter-protocol";
import { _setEditorState, editorState } from "../../editor-state";

export type FilterViewMode = "active_filters" | "tags" | "categories";
export interface ActiveFilterItem {
    packageId: string;
    type: FilterTypes;
    id: string;
    label: string;
}

export class NodeFilterController {
    private getState: () => NodeFilterState;
    private updateState: (updater: (prev: NodeFilterState) => Partial<NodeFilterState>) => void;
    private setActiveFilterEntry: (key: string, value: ActiveFilterItem | undefined) => void;

    constructor(sceneId?: string) {
        if (sceneId) {
            if (!editorState.scenes[sceneId]) {
                _setEditorState("scenes", sceneId, {
                    nodeFilterState: createDefaultNodeFilterState(),
                });
            } else if (!editorState.scenes[sceneId].nodeFilterState) {
                _setEditorState("scenes", sceneId, "nodeFilterState", createDefaultNodeFilterState());
            }

            this.getState = () => editorState.scenes[sceneId].nodeFilterState;
            this.updateState = (updater) => {
                _setEditorState("scenes", sceneId, "nodeFilterState", (prev) => ({
                    ...prev,
                    ...updater(prev),
                }));
            };

            this.setActiveFilterEntry = (key, value) => {
                _setEditorState("scenes", sceneId, "nodeFilterState", "activeFilters", key, value!);
            };
            return;
        }

        const [localState, setLocalState] = createStore<NodeFilterState>(createDefaultNodeFilterState());
        this.getState = () => localState;

        this.updateState = (updater) => {
            setLocalState((prev) => ({
                ...prev,
                ...updater(prev),
            }));
        };

        this.setActiveFilterEntry = (key, value) => {
            setLocalState("activeFilters", key, value!);
        };
    }

    // TODO: getFilteredNodes baseado nos filtros ativos
    get state() { return this.getState(); }
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
    public getPackageActiveFilters(packageId: string) {
        return this.activeFiltersList.filter((filter) => filter.packageId == packageId);
    }


    public openPackageTags(packageId: string) {
        this.updateState(() => ({
            view: "tags",
            selectedPackageId: packageId,
        }));
    }

    public openPackageCategories(packageId: string) {
        this.updateState(() => ({
            view: "categories",
            selectedPackageId: packageId,
        }));
    }

    public goBack() {
        this.updateState(() => ({
            view: "active_filters",
            selectedPackageId: null,
        }));
    }


    public isFilterActive(packageId: string, type: FilterTypes, id: string): boolean {
        return Boolean(this.state.activeFilters[makeNodeFilterKey(packageId, type, id)]);
    }

    public activateFilter(item: ActiveFilterItem) {
        const key = makeNodeFilterKey(item.packageId, item.type, item.id);
        this.setActiveFilterEntry(key, item);
    }

    public deactivateFilter(packageId: string, type: FilterTypes, id: string) {
        const key = makeNodeFilterKey(packageId, type, id);
        this.setActiveFilterEntry(key, undefined!);
    }
}