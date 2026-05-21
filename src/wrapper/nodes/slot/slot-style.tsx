import { createSignal } from "solid-js";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { BaseSlotType } from "../data/slot-types";

// FIXME: Move this to editor/ui/node
export class NodeSlotStyle {
    default_anchor: Vector2;
    _anchor: () => Vector2;
    _set_anchor: (v: Vector2) => void;

    _version: () => number;
    _set_version: (v: number) => void;  

    constructor(slot_type: BaseSlotType, is_input: boolean) {
        this.default_anchor = {x: is_input ? -1 : 1, y: 0}

        // Gambiarra
        const [version, setVersion] = createSignal(0);
        this._version = version;
        this._set_version = setVersion;

        const [anchor, setAnchor] = createSignal(this.default_anchor);
        this._anchor = anchor;
        this._set_anchor = setAnchor;
    }
    
    get version() { return this._version(); }

    get anchor() { return this._anchor(); }
    set anchor(v: Vector2) { this._set_anchor(v); }

    public update_anchor(new_anchor: Vector2) {
        if (this.anchor.x === new_anchor.x && this.anchor.y === new_anchor.y) {
            return;
        };

        this.anchor = new_anchor;
        requestAnimationFrame(() => {
            this._set_version(this.version + 1);
        });
    }
}