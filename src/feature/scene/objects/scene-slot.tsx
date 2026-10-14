import { createStore, SetStoreFunction } from "solid-js/store";
import { SlotInstance, SlotInstanceData } from "~/feature/editor/engine/graph/node-instance";
import { SlotPathData } from '../../../protocols/nodeblocks/manifests/node/node-graph-data';
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { TypeSpecRegistry } from "~/feature/editor/engine/type-registry";

export interface SlotUIStore {
    isSelected: boolean;
    anchor: Vector2;
    defaultAnchor: Vector2;
    worldPos: Vector2 | null
    // zIndex: number;
}

export class SceneNodeSlot {
    private _setDataStore: SetStoreFunction<SlotInstanceData>;
    private _dataStore: SlotInstanceData;

    private _uiStore: SlotUIStore;
    private _setUiStore: SetStoreFunction<SlotUIStore>;

    public _element?: HTMLDivElement;
    private _cleanupDataSub: () => void;

    constructor(
        public readonly instance: SlotInstance
    ) {
        const defaultAnchor = {x: instance.is_input ? -1 : 1, y: 0};
        [this._dataStore, this._setDataStore] = createStore<SlotInstanceData>({
            connection_count: instance.connection_count
        });
        
        this._cleanupDataSub = instance.subscribe((new_data) => {
            this._setDataStore(new_data);
        });

        [this._uiStore, this._setUiStore] = createStore<SlotUIStore>({
            isSelected: false,
            anchor: defaultAnchor,
            defaultAnchor: defaultAnchor,
            worldPos: null
        });
    }
    
    // Scene Data getters/setters
    get slot_id() { return this.instance.slot_id; }
    get node_id() { return this.instance.node_id; }
    
    get connection_count() { return this._dataStore.connection_count }

    get isInput() { return this.instance.is_input; }

    get path(): SlotPathData { return { node_id: this.node_id, slot_id: this.slot_id }; }

    // UI getters/setters

    get isSelected() { return this._uiStore.isSelected; }
    set isSelected(selected: boolean) { this._setUiStore("isSelected", selected); }

    get anchor() { return this._uiStore.anchor; }
    set anchor(anchor: Vector2) { this._setUiStore("anchor", anchor); }

    get defaultAnchor() { return this._uiStore.defaultAnchor; }
    set defaultAnchor(anchor: Vector2) { this._setUiStore("defaultAnchor", anchor); }

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
        this._cleanupDataSub();
    }
}