import { createSignal } from "solid-js";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { CanvasCamera } from "../../canvas/editor-space";

export class Grid {
    private _grid_size: () => Vector2;
    private _set_grid_size: (grid_size: Vector2) => void;

    constructor(grid_size: Vector2) {
        [this._grid_size, this._set_grid_size] = createSignal(grid_size)
    }

    get grid() { return this._grid_size() }
    set grid(grid_size: Vector2) { this._set_grid_size(grid_size) }

    public roundPos(position: Vector2): Vector2 {
        return {
            x: Math.round(position.x / this.grid.x) * this.grid.x,
            y: Math.round(position.y / this.grid.y) * this.grid.y
        }
    }
    
    public View(camera: CanvasCamera) {
        return (
            <div class="grid"
                style={{
                    "background-position": `${-camera.offset.x * camera.zoom}px ${-camera.offset.y * camera.zoom}px `,
                    "background-size": `${this._grid_size().x * camera.zoom}px ${this._grid_size().y * camera.zoom}px`
                }}
            >
            </div>
        )
    }
}