import { Rect, Vector2 } from "~/protocols/nodeblocks/geometry";
import { createSignal, Accessor } from 'solid-js';
import { Grid } from "./grid";

export class CanvasCamera {
    private _rawSize: Accessor<Vector2>;
    private _setRawSize: (value: Vector2) => void;

    private _camera_rect: () => Rect;
    private _set_camera_rect: (value: Rect) => void;

    private _zoom: () => number;
    private _setZoom: (v: number) => void;

    constructor(initialSize: Vector2) {
        [this._zoom, this._setZoom] = createSignal(1.0);
        [this._rawSize, this._setRawSize] = createSignal(initialSize);

        [this._camera_rect, this._set_camera_rect] = createSignal(
            new Rect({ x: 0, y: 0 }, { 
                x: this._rawSize().x / this._zoom(), 
                y: this._rawSize().y / this._zoom() 
            })
        );
    }

    get camera_rect() { return this._camera_rect(); }
    set camera_rect(value: Rect) { this._set_camera_rect(value); }

    get offset() { return this.camera_rect.offset; }
    get zoom() { return this._zoom(); }

    set zoom(new_zoom: number) { 
        const clampedZoom = Math.max(0.1, Math.min(new_zoom, 5.0));
        this._setZoom(clampedZoom);
        
        const size = this._rawSize();
        this.camera_rect.size = { x: size.x / clampedZoom, y: size.y / clampedZoom };
    }

    get rawSize() { return this._rawSize(); }

    get size() { return this._rawSize(); }
    set size(new_size: Vector2) {
        this._setRawSize(new_size);
        const z = this.zoom;
        this.camera_rect.size = { x: new_size.x / z, y: new_size.y / z };
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
        this.camera_rect.offset = {
            x: this.camera_rect.offset.x + new_offset.x, 
            y: this.camera_rect.offset.y + new_offset.y
        };
    }
}

export class CanvasSpace {  
    camera: CanvasCamera;
    grid: Grid;

    private _cursor_world_pos: () => Vector2;
    private _set_cursor_world_pos: (pos: Vector2) => void; 

    constructor(
        initialSize: Vector2 = { x: 1920, y: 1080 },
        gridSize: Vector2 = { x: 20, y: 20}
    ) {
        this.camera = new CanvasCamera(initialSize);
        this.grid = new Grid(gridSize);
        [this._cursor_world_pos, this._set_cursor_world_pos] = createSignal({x: 0, y: 0});
    }

    get cursorWorldPos() { return this._cursor_world_pos(); }
    set cursorWorldPos(pos: Vector2) { this._set_cursor_world_pos(pos); }

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

        const screen_pos = { x: mouse_x, y: mouse_y };
        return [screen_pos, this.screen_pos_to_world_pos(screen_pos)];
    }

    public screen_pos_to_world_pos(screen_pos: Vector2) {
        return {
            x: screen_pos.x / this.camera.zoom + this.camera.offset.x,
            y: screen_pos.y / this.camera.zoom + this.camera.offset.y,
        }
    }

    public teleport_to_rect(rect: Rect) {
        this.camera.updateOffset({
            x: (rect.offset.x + rect.size.x / 2) - this.camera.size.x / 2 / this.camera.zoom, 
            y: (rect.offset.y + rect.size.y / 2) - this.camera.size.y / 2 / this.camera.zoom
        });
    }

    public teleport_to_pos(pos: Vector2) {
        this.camera.updateOffset({
            x: (pos.x) - this.camera.size.x / 2 / this.camera.zoom, 
            y: (pos.y) - this.camera.size.y / 2 / this.camera.zoom
        });
    }
}