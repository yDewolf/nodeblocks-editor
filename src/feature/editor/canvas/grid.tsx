import { createSignal } from "solid-js";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

export class Grid {
    private _grid_size: () => Vector2;
    private _set_grid_size: (grid_size: Vector2) => void;

    constructor(grid_size: Vector2) {
        [this._grid_size, this._set_grid_size] = createSignal(grid_size)
    }

    get grid() { return this._grid_size() }
    set grid(grid_size: Vector2) { this._set_grid_size(grid_size) }

    public roundVector(vector: Vector2): Vector2 {
        const rounded = {
            x: Math.ceil(vector.x / this.grid.x) * this.grid.x,
            y: Math.ceil(vector.y / this.grid.y) * this.grid.y
        }
        return rounded;
    }
}