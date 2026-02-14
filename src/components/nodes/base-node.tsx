import { createSignal } from 'solid-js';
import { Vector2 } from '../../data_types/geometry';

export class BaseNode {
    id: number;
    node_name: string;
    // Usamos signals para que a UI saiba quando atualizar
    private _pos: () => Vector2;
    private _setPos: (v: Vector2) => void;

    constructor(node_name: string, position: Vector2, id: number = -1) {
        this.id = id;
        this.node_name = node_name;

        const [pos, setPos] = createSignal(position);
        this._pos = pos;
        this._setPos = setPos;
    }
    
    get x() { return this._pos().x }
    get y() { return this._pos().y }
    get pos() { return this._pos() }

    updatePosition(new_pos: Vector2) {
        this._setPos(new_pos)
    }
    
    public get_relative_pos(camera_offset: Vector2) {
        return { x: (this.x - camera_offset.x), y: (this.y - camera_offset.y) };
    }
}
