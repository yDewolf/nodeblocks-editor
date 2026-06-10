import { createSignal } from "solid-js";
import { EditorCamera } from "~/editor/internal/editor-space";
import { Vector2 } from "~/wrapper/data_types/geometry";

export class Grid {
    _grid_size: () => Vector2;
    _set_grid_size: (grid_size: Vector2) => void;

    constructor(grid_size: Vector2) {
        const [gridSize, setGridSize] = createSignal(grid_size)

        this._grid_size = gridSize;
        this._set_grid_size = setGridSize
    }

    get grid() { return this._grid_size() }
    set grid(grid_size: Vector2) { this._set_grid_size(grid_size) }

    public View(camera: EditorCamera) {
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