import { createSignal } from "solid-js";

export enum MouseButtons {
    NONE,
    LEFT = 1,
    RIGHT = 2,
    MIDDLE = 4,
    SCROLL
}

export const MBUTTON_CODES = Object.values(MouseButtons).filter((item): item is number => typeof item === 'number');

export enum KeyModifiers {
    CTRL,
    SHIFT,
    ALT
}

export interface KeybindMapBinds {
    mouse_buttons?: MouseButtons[], 
    keys?: string[], 
    modifiers?: KeyModifiers[]
}


export class KeybindMap {
    private _mouse_buttons: MouseButtons[];
    private _keys: string[];
    private _modifiers: KeyModifiers[];
    private _active: () => boolean;
    private _set_active: (v: boolean) => void;

    constructor(binds: KeybindMapBinds) {
        const [active, setActive] = createSignal(false);
        this._active = active;
        this._set_active = setActive;
        
        this._mouse_buttons = binds.mouse_buttons == null ? [] : binds.mouse_buttons;
        this._keys = binds.keys == null ? [] : binds.keys;
        this._modifiers = binds.modifiers == null ? [] : binds.modifiers;
    }

    get active() { return this._active(); }
    set active(value: boolean) { this._set_active(value); }

    get mouse_buttons() { return this._mouse_buttons; }
    get keys() { return this._keys; }
    get modifiers() { return this._modifiers; }

    public update_active(keys: Record<string, boolean>, mouse_buttons: Record<number, boolean>, modifiers: Record<number, boolean>): boolean {
        let is_now_active = true;
        if (this._keys.length > 0 && this._keys.some(key => !(keys[key]))) {
            is_now_active = false;
        }

        if (is_now_active && this._mouse_buttons.length > 0 && this._mouse_buttons.some(button => !(mouse_buttons[button]))) {
            is_now_active = false;
        }

        if (is_now_active && this._modifiers.length > 0 && this._modifiers.some(mod => !(modifiers[mod]))) {
            is_now_active = false;
        }

        if (this.active !== is_now_active) {
            this.active = is_now_active;
        }
        return is_now_active;
    }

    public set_mouse_buttons(buttons: MouseButtons[]) {
        this._mouse_buttons = buttons;
    }

    public set_keys(keys: string[]) {
        this._keys = keys;
    }

    public set_modifiers(modifiers: KeyModifiers[]) {
        this._modifiers = modifiers;
    }
}

export class Keybind {
    keybind_name: string;
    maps: KeybindMap[];

    constructor(name: string, maps: KeybindMap[]) {
        this.keybind_name = name;
        this.maps = maps;
    }

    public add_map(map: KeybindMap) {
        if (this.maps.includes(map)) {
            return;
        }
        this.maps = [...this.maps, map];
    }

    public remove_map(map: KeybindMap) {
        this.maps = this.maps.filter((_map: KeybindMap) => {
            return _map !== map;
        })
    }

    public is_active(): boolean {
        const active = this.maps.some(map => map.active)
        return active;
    }
}

export interface KeyEventData {
    event: UIEvent
}
