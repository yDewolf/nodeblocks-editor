import { createStore, SetStoreFunction } from "solid-js/store";
import { SlotInstance } from "~/feature/editor/engine/graph/node-instance";
import { SlotPathData } from '../../../protocols/nodeblocks/manifests/node/node-graph-data';
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { TypeSpecRegistry } from "~/feature/editor/engine/type-registry";

export interface SlotUIStore {
    isSelected: boolean;
    anchor: Vector2;
    worldPos: Vector2 | null
    // zIndex: number;
}

export class SceneNodeSlot {
    private _uiStore: SlotUIStore;
    private _setUiStore: SetStoreFunction<SlotUIStore>;

    public _element?: HTMLDivElement;

    constructor(
        public readonly instance: SlotInstance
    ) {
        [this._uiStore, this._setUiStore] = createStore<SlotUIStore>({
            isSelected: false,
            anchor: {x: 0, y: 0},
            worldPos: null
        });
    }
    
    // Scene Data getters/setters
    get slot_id() { return this.instance.slot_id; }
    get node_id() { return this.instance.node_id; }
    
    get connection_count() { return this.instance.connection_count }
    get isInput() { return this.instance.is_input; }

    get path(): SlotPathData { return { node_id: this.node_id, slot_id: this.slot_id }; }

    // UI getters/setters

    get isSelected() { return this._uiStore.isSelected; }
    set isSelected(selected: boolean) { this._setUiStore("isSelected", selected); }

    get anchor() { return this._uiStore.anchor; }
    set anchor(anchor: Vector2) { this._setUiStore("anchor", anchor); }

    get worldPos(): Vector2 | null { return this._uiStore.worldPos; }
    set worldPos(pos: Vector2) { this._setUiStore("worldPos", pos); }

    public updateUi(patch: Partial<SlotUIStore>): void {
        this._setUiStore((prev) => ({ ...prev, ...patch }));
    }


    public canConnectTo(slot: SceneNodeSlot, registry: TypeSpecRegistry) {
        if (!this.instance.can_connect || !slot.instance.can_connect) {
            return false;
        }

        if (!registry.areTypesCompatible(this.instance.data_type_fqn, slot.instance.data_type_fqn)) {
            return false;
        }

        return true;
    }


    public dispose(): void {
        // this._cleanupDataSub();
    }
}