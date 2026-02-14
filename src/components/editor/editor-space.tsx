import { Rect, Vector2 } from "~/data_types/geometry";
import { BaseNode } from "../nodes/base-node";
import { createSignal } from 'solid-js';

export class EditorCamera {
    camera_rect: Rect
    zoom: number = 1.0

    _offset: () => Vector2;
    _setOffset: (v: Vector2) => void;

    constructor(size: Vector2) {
        const [offset, setOffset] = createSignal({x: 0, y: 0});
        this._offset = offset;
        this._setOffset = setOffset;

        this.camera_rect = new Rect(offset(), size);
    }

    get offset() { return this._offset() }
    updateOffset(new_offset: Vector2) {
        this._setOffset(new_offset);
    }
}


export class EditorSpace {  
    camera: EditorCamera
    
    constructor() {
        this.camera = new EditorCamera({x: 1920, y: 1080});
    }

    public filter_visible_nodes(nodes: Array<BaseNode>) {
        const filtered_nodes = nodes.filter(node => {
            return this.is_point_visible(node.pos) // FIXME Alterar isso aqui para usar um rect do node 
        });

        return filtered_nodes
    }

    public is_point_visible(point: Vector2) {
        return this.camera.camera_rect.has_point(point);
    }

    public is_rect_visible(rect: Rect) {
        return this.camera.camera_rect.overlaps(rect);
    }
}