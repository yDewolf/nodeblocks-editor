import { SetStoreFunction, createStore } from "solid-js/store";
import { Vector2, Rect } from "~/protocols/nodeblocks/geometry";
import { ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { SceneNodeSlot } from "./scene-slot";

export interface ConnUIState {

}

export class SceneConnection {
    private _setDataStore: SetStoreFunction<ConnectionSceneData>;
    private _dataStore: ConnectionSceneData;
    
    // private _uiStore: ConnUIState;
    // private _setUiStore: SetStoreFunction<ConnUIState>;

    constructor(
        public readonly _data: ConnectionSceneData,
        private readonly _input_slot: SceneNodeSlot,
        private readonly _output_slot: SceneNodeSlot
    ) {
        [this._dataStore, this._setDataStore] = createStore({ ..._data });
        
        // [this._uiStore, this._setUiStore] = createStore<ConnUIState>({

        // });
    }
    
    // Scene Data getters/setters

    get data() { return this._dataStore; }
    get uid() { return this._dataStore.uid; }

    get input_slot() { return this._input_slot; }
    get output_slot() { return this._output_slot; }


    // UI getters/setters

    // public updateUi(patch: Partial<ConnUIState>): void {
    //     this._setUiStore((prev) => ({ ...prev, ...patch }));
    // }

    public dispose(): void {

    }
}