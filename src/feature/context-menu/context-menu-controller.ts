import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { ContextMenuState, ContextMenuItem } from "./context-menu-protocol";

export class ContextMenuController {
    private _state: ContextMenuState;
    private _setState: SetStoreFunction<ContextMenuState>;

    constructor() {
        [this._state, this._setState] = createStore<ContextMenuState>({
            isOpen: false,
            x: 0,
            y: 0,
            items: []
        });
    }

    public open(e: MouseEvent, items: ContextMenuItem[]) {
        e.preventDefault();
        
        if (items.length == 0) { return; }
        e.stopPropagation();

        this._setState(
            produce((state) => {
                state.isOpen = true;
                state.x = e.clientX;
                state.y = e.clientY;
                state.items = items;
            })
        );
    }

    public close = () => {
        this._setState("isOpen", false);
    };

    public getState() {
        return this._state;
    }
}

// FIXME: talvez passar isso aqui em um context provider
export const contextMenuManager = new ContextMenuController();
