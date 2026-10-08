import { SetStoreFunction, createStore } from "solid-js/store";
import { NodeInstance } from "~/feature/editor/engine/graph/node-instance";
import { Rect, Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

export interface NodeUiState {
    // isCurrentStep: boolean; // talvez isso aqui nem deva ficar aqui
    isSelected: boolean;
    size: Vector2;
    // zIndex: number;
}

export class SceneNode {
    private _dataStore: NodeSceneData;
    private _setDataStore: SetStoreFunction<NodeSceneData>;
    
    private _uiStore: NodeUiState;
    private _setUiStore: SetStoreFunction<NodeUiState>;

    private _cleanupDataSub: () => void;

    constructor(
        public readonly instance: NodeInstance
    ) {
        [this._dataStore, this._setDataStore] = createStore({ ...instance.scene_data });

        this._cleanupDataSub = instance.subscribe((new_data) => {
            this._setDataStore(new_data);
        });
        
        [this._uiStore, this._setUiStore] = createStore<NodeUiState>({
            isSelected: false,
            size: { x: 100, y: 150 },
        });
    }
    
    // Scene Data getters/setters

    get data() { return this._dataStore; }

    get position() { return this._dataStore.position; }
    set position(new_pos: Vector2) { this.instance.updateSceneData(undefined, new_pos); }
    
    get parameters() { return this._dataStore.data; }
    
    public setParam(param_key: string, value: any) {
        this._setDataStore("data", param_key, value);
    }

    // UI getters/setters

    get isSelected() { return this._uiStore.isSelected; }
    set isSelected(selected: boolean) { this._setUiStore("isSelected", selected); }

    get size() { return this._uiStore.size; }
    set size(new_size: Vector2) { this._setUiStore("size", new_size); }

    get rect() { return new Rect(this.position, this.size)}

    public updateUi(patch: Partial<NodeUiState>): void {
        this._setUiStore((prev) => ({ ...prev, ...patch }));
    }

    public dispose(): void {
        this._cleanupDataSub();
    }
}