import { SetStoreFunction, createStore } from "solid-js/store";
import { NodeInstance } from "~/feature/editor/engine/graph/node-instance";
import { Rect, Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { SceneNodeSlot } from "./scene-slot";

export interface NodeUIState {
    // isCurrentStep: boolean; // talvez isso aqui nem deva ficar aqui
    isSelected: boolean;
    size: Vector2;
    
    // Corresponds to the "real" position of the node before any modifications
    uiPosition: Vector2; 
    
    minSize: Vector2;
    // zIndex: number;
}

export class SceneNode {
    private _setDataStore: SetStoreFunction<NodeSceneData>;
    private _dataStore: NodeSceneData;
    
    private _uiStore: NodeUIState;
    private _setUiStore: SetStoreFunction<NodeUIState>;

    private _cleanupDataSub: () => void;
    private node_slots: Record<string, SceneNodeSlot>;
    private _input_slots: Array<SceneNodeSlot>;
    private _output_slots: Array<SceneNodeSlot>;

    constructor(
        public readonly instance: NodeInstance
    ) {
        this.node_slots = {};
        for (const [slot_id, slot_instance] of Object.entries(instance.slots)) {
            this.node_slots[slot_id] = new SceneNodeSlot(slot_instance);
        }
        this._input_slots = Object.values(this.node_slots).filter((slot) => slot.isInput);
        this._output_slots = Object.values(this.node_slots).filter((slot) => !slot.isInput);

        [this._dataStore, this._setDataStore] = createStore({ ...instance.scene_data });

        this._cleanupDataSub = instance.subscribe((new_data) => {
            this._setDataStore(new_data);
        });
        
        [this._uiStore, this._setUiStore] = createStore<NodeUIState>({
            isSelected: false,
            size: { x: 100, y: 150 },
            uiPosition: instance.scene_data.position,
            minSize: { x: 0, y: 0 }
        });
    }
    
    // Scene Data getters/setters

    get data() { return this._dataStore; }
    
    get uid() { return this._dataStore.uid; }
    get fqn() { return this._dataStore.nodetype_fqn; }

    // Actual node position (that server knows about)
    get position() { return this._dataStore.position; }
    set position(new_pos: Vector2) { this.instance.updateSceneData(undefined, new_pos); }
    
    get width() { return this.size.x; }
    get height() { return this.size.y; }

    get parameters() { return this._dataStore.data; }
    get parameterSpecs() { return this.instance.spec.parameters }
    
    public setParam(param_key: string, value: any) {
        this._setDataStore("data", param_key, value);
    }

    // UI getters/setters

    get isSelected() { return this._uiStore.isSelected; }
    set isSelected(selected: boolean) { this._setUiStore("isSelected", selected); }

    get size() { return this._uiStore.size; }
    set size(new_size: Vector2) { 
        if (new_size.x == 0 && new_size.y == 0) {
            return;
        }
        this._setUiStore("size", new_size); 
    }

    get minSize() { return this._uiStore.minSize; }
    set minSize(new_size: Vector2) { 
        this._setUiStore("minSize", new_size);
        this.size = {
            x: this.size.x > new_size.x ? this.size.x : new_size.x,
            y: this.size.y > new_size.y ? this.size.y : new_size.y
        } 
    }

    get rect() { return new Rect(this.position, this.size)}

    // Corresponds to the "real" position of the node before any modifications
    get uiPosition() { return this._uiStore.uiPosition; }
    set uiPosition(pos: Vector2) { this._setUiStore("uiPosition", pos); }

    // Other getters
    get all_slots() { return Object.values(this.node_slots); }
    get slots() { return this.node_slots; }

    get input_slots() { return this._input_slots; }
    get output_slots() { return this._output_slots; }

    public updateUi(patch: Partial<NodeUIState>): void {
        this._setUiStore((prev) => ({ ...prev, ...patch }));
    }

    public dispose(): void {
        this._cleanupDataSub();
    }
}