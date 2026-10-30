import { createSignal } from "solid-js";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { Rect, Vector2 } from "~/protocols/nodeblocks/geometry";

export class SelectionRect {
    _rect: () => Rect
    _set_rect: (rect: Rect) => void

    origin: Vector2

    _active: () => boolean;
    _set_active: (b: boolean) => void;

    constructor() {
        this.origin = {x: 0, y: 0};

        [this._active, this._set_active] = createSignal(false);
        [this._rect, this._set_rect] = createSignal(
            new Rect({x: 0, y: 0}, {x: 0, y: 0})
        );
    }

    get rect() { return this._rect() }
    get active() { return this._active() }
    set active(b: boolean) { this._set_active(b) }

    get pos() { return this.rect.offset }
    get size() { return this.rect.size }

    set pos(pos: Vector2) { this.rect.offset = pos }
    set size(size: Vector2) { this.rect.size = size }

    public get_overlapping_nodes(all_nodes: SceneNode[]): Array<SceneNode> {
        let selected_nodes: Array<SceneNode> = new Array<SceneNode>();
        all_nodes.forEach(node => {
            if (this.has_node(node)) {
                selected_nodes.push(node);
            }
        });

        return selected_nodes;
    }

    public has_node(node: SceneNode): boolean {
        if (this.rect.overlaps(node.rect)) {
            return true;
        }
        
        return false;
    }

    public View() {
        return (<div
            class="selection-rect"
            style={{
                transform: `translate(${this.pos.x}px, ${this.pos.y}px)`,
                width: `${this.size.x}px`,
                height: `${this.size.y}px`,
                "pointer-events": "none",
                "z-index": 2
            }}
        >
        </div>)
    }
}