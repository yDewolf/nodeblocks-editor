import { createSignal } from 'solid-js';
import { Vector2 } from '../../data_types/geometry';

export class BaseNode {
    id: number;
    node_name: string;
    // Usamos signals para que a UI saiba quando atualizar
    private raw_pos: Vector2;

    private _pos: () => Vector2;
    private _setPos: (v: Vector2) => void;

    constructor(node_name: string, position: Vector2, id: number = -1) {
        this.id = id;
        this.node_name = node_name;
        this.raw_pos = position;

        const [pos, setPos] = createSignal(position);
        this._pos = pos;
        this._setPos = setPos;
    }
    
    get x() { return this._pos().x }
    get y() { return this._pos().y }
    get pos() { return this._pos() }

    public move(delta: Vector2, grid_size: Vector2) {
        this.raw_pos.x += delta.x;
        this.raw_pos.y += delta.y;

        const newPosX = Math.round(this.raw_pos.x / grid_size.x) * grid_size.x;
        const newPosY = Math.round(this.raw_pos.y / grid_size.y) * grid_size.y;

        if (newPosX !== this.x || newPosY !== this.y) {
            this._setPos({x: newPosX, y: newPosY});
        }
    }

    public select() {
        console.log("hi")
    }

    public get_relative_pos(camera_offset: Vector2) {
        return { x: (this.x - camera_offset.x), y: (this.y - camera_offset.y) };
    }
}
