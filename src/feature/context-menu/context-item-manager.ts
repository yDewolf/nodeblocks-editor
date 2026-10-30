import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { ContextMenuItem, ContextMenuState } from "./context-menu-protocol";

export class ContextMenuItemManager {
    private _items: ContextMenuItem[];
    private _setItems: SetStoreFunction<ContextMenuItem[]>;

    constructor(defaultItems?: ContextMenuItem[]) {
        [this._items, this._setItems] = createStore<ContextMenuItem[]>(
            defaultItems ?? []
        );
    }

    public updateItems(items: ContextMenuItem[]) {
        this._setItems(items);
    }

    get items() { return this._items; }
}
