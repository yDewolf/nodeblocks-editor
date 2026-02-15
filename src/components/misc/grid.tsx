import { createSignal } from "solid-js";
import { Vector2 } from "~/data_types/geometry";

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

    public View() {
        return (
            <div class="grid"
                style={{
                    position: "absolute",
                    margin: 0,
                    height: "100%",
                    width: "100%",
                    "background-image": "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)",
                    "background-size": `${this._grid_size().x}px ${this._grid_size().y}px`
                }}
            >
                
            </div>
        )
    }
}