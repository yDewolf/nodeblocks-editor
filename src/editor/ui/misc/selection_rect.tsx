import { createSignal } from "solid-js";
import { EditorCamera } from "~/editor/internal/editor-space";
import { Rect, Vector2 } from "~/wrapper/data_types/geometry";
import { GraphNode } from "~/wrapper/nodes/graph-node";

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

    public get_overlapping_nodes(all_nodes: GraphNode[]): Array<GraphNode> {
        let selected_nodes: Array<GraphNode> = new Array<GraphNode>();
        all_nodes.forEach(node => {
            if (this.has_node(node)) {
                selected_nodes.push(node);
            }
        });

        return selected_nodes;
    }

    public has_node(node: GraphNode): boolean {
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