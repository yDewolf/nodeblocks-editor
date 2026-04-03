import { Rect, Vector2 } from "~/data_types/geometry";
import { BaseNode } from "../nodes/base-node";
import { createSignal } from 'solid-js';

export class EditorCamera {
    private raw_size: Vector2

    private _camera_rect: () => Rect;
    private _set_camera_rect: (value: Rect) => void;

    private _zoom: () => number;
    private _setZoom: (v: number) => void;

    constructor(size: Vector2) {
        const [zoom, setZoom] = createSignal(1.0);
        this._zoom = zoom;
        this._setZoom = setZoom;
        
        this.raw_size = size;
        const [cameraRect, setCameraRect] = createSignal(new Rect({x: 0, y: 0}, {x: this.raw_size.x / zoom(), y: this.raw_size.y / zoom()}));
        this._camera_rect = cameraRect;
        this._set_camera_rect = setCameraRect;
    }

    get camera_rect() { return this._camera_rect(); }
    set camera_rect(value: Rect) { this._set_camera_rect(value) }

    get offset() { return this.camera_rect.offset; }
    get zoom() { return this._zoom(); }

    set zoom(new_zoom: number) { 
        this._setZoom(Math.max(0.1, Math.min(new_zoom, 5.0)));
        this.camera_rect.size = {x: this.raw_size.x / new_zoom, y: this.raw_size.y / new_zoom}
    }

    set size(new_size: Vector2) {
        this.raw_size = new_size;
    }

    public move(delta: Vector2) {
        this.camera_rect.offset = {
            x: this.offset.x + delta.x,
            y: this.offset.y + delta.y
        };
    }

    public updateOffset(new_offset: Vector2) {
        this.camera_rect.offset = new_offset;
    }

    public addOffset(new_offset: Vector2) {
        this.camera_rect.offset = {x: this.camera_rect.offset.x + new_offset.x, y: this.camera_rect.offset.y + new_offset.y}
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

    public get_cursor_pos(e: MouseEvent): [Vector2, Vector2] {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mouse_x = e.clientX - rect.left;
        const mouse_y = e.clientY - rect.top;

        const world_mouse_x = (mouse_x / this.camera.zoom) + this.camera.offset.x;
        const world_mouse_y = (mouse_y / this.camera.zoom) + this.camera.offset.y;

        return [{x: mouse_x, y: mouse_y}, {x: world_mouse_x, y: world_mouse_y}]
    }
}