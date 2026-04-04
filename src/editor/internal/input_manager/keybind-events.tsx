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
    mouse_buttons?: Map<MouseButtons, boolean>;
    keys?: Map<string, boolean>;
    modifiers?: Map<KeyModifiers, boolean>;
}


export class KeybindMap {
    private _mouse_buttons: Map<MouseButtons, boolean>;
    private _keys: Map<string, boolean>;
    private _modifiers: Map<KeyModifiers, boolean>;
    private _active: () => boolean;
    private _set_active: (v: boolean) => void;

    constructor(binds: KeybindMapBinds) {
        const [active, setActive] = createSignal(false);
        this._active = active;
        this._set_active = setActive;
        
        this._mouse_buttons = binds.mouse_buttons == null ? new Map() : binds.mouse_buttons;
        this._keys = binds.keys == null ? new Map() : binds.keys;
        this._modifiers = binds.modifiers == null ? new Map() : binds.modifiers;
    }

    get active() { return this._active(); }
    set active(value: boolean) { this._set_active(value); }

    get mouse_buttons() { return this._mouse_buttons; }
    get keys() { return this._keys; }
    get modifiers() { return this._modifiers; }

    public update_active(keys: Record<string, boolean>, mouse_buttons: Record<number, boolean>, modifiers: Record<number, boolean>): boolean {
        let is_now_active = true;
        if (this._keys.size > 0 && this._keys.entries().toArray().every(key => {if (!key[1]) {return keys[key[0]]} else {return !keys[key[0]]}})) {
            is_now_active = false;
        }

        if (is_now_active && this._mouse_buttons.size > 0 && this._mouse_buttons.entries().toArray().every(key => {if (!key[1]) {return mouse_buttons[key[0]]} else {return !mouse_buttons[key[0]]}})) {
            is_now_active = false;
        }

        if (is_now_active && this.modifiers.size > 0 && this.modifiers.entries().toArray().every(key => {if (!key[1]) {return modifiers[key[0]]} else {return !modifiers[key[0]]}})) {
            is_now_active = false;
        }

        if (this.active !== is_now_active) {
            this.active = is_now_active;
        }
        return is_now_active;
    }

    public set_mouse_buttons(buttons: Map<MouseButtons, boolean>) {
        this._mouse_buttons = buttons;
    }

    public set_keys(keys: Map<string, boolean>) {
        this._keys = keys;
    }

    public set_modifiers(modifiers: Map<KeyModifiers, boolean>) {
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
