import { createMemo, createSignal } from "solid-js";
import { Rect, Vector2 } from "~/data_types/geometry";
import { EditorCamera } from "../editor/editor-space";
import { BaseNode } from "../nodes/base-node";

export class SelectionRect {
    _rect: () => Rect
    _set_rect: (rect: Rect) => void

    origin: Vector2

    ref_cam: EditorCamera
    _active: () => boolean;
    _set_active: (b: boolean) => void;

    constructor(ref_cam: EditorCamera) {
        this.ref_cam = ref_cam;
        this.origin = {x: 0, y: 0};

        const [active, setActive] = createSignal(false);
        this._active = active;
        this._set_active = setActive;

        const [rect, setRect] = createSignal(new Rect({x: 0, y: 0}, {x: 0, y: 0}));
        this._rect = rect;
        this._set_rect = setRect;
    }

    get rect() { return this._rect() }
    get active() { return this._active() }
    set active(b: boolean) { this._set_active(b) }

    get pos() { return this.rect.offset }
    get size() { return this.rect.size }

    set pos(pos: Vector2) { this.rect.offset = pos }
    set size(size: Vector2) { this.rect.size = size }

    public get_overlapping_nodes(all_nodes: BaseNode[]): Array<BaseNode> {
        let selected_nodes: Array<BaseNode> = new Array<BaseNode>();
        all_nodes.forEach(node => {
            if (this.rect.has_point(node.pos)) {
                selected_nodes.push(node);
            }
        });

        return selected_nodes;
    }

    public View() {
        const relativePos = createMemo(() => ({
            x: this.pos.x - this.ref_cam.offset.x,
            y: this.pos.y - this.ref_cam.offset.y,
        }));

        return (<div
            class="selection-rect"
            style={{
                transform: `translate(${relativePos().x}px, ${relativePos().y}px)`,
                width: `${this.size.x}px`,
                height: `${this.size.y}px`,
                "pointer-events": "none",
                "z-index": 2
            }}
        >
        </div>)
    }
}