import { createSignal } from "solid-js"

export type Vector2 = {
    x: number,
    y: number
}

export class Rect {
    _offset: () => Vector2
    _setOffset: (v: Vector2) => void
    _size: () => Vector2
    _setSize: (v: Vector2) => void

    constructor (offset: Vector2, size: Vector2) {
        const [offsetS, setOffset] = createSignal(offset);
        this._offset = offsetS;
        this._setOffset = setOffset;

        const [sizeS, setSize] = createSignal(size);
        this._size = sizeS;
        this._setSize = setSize;
    }
    
    get offset() { return this._offset(); }
    get size() { return this._size(); }

    set offset(offset: Vector2) { this._setOffset(offset); }
    set size(size: Vector2) { this._setSize(size); }

    public overlaps(rect: Rect) {
        return !(
            this.offset.x <= rect.size.x ||
            this.size.x >= rect.offset.x ||
            this.offset.y <= rect.size.y ||
            this.size.y >= rect.offset.y
        )
    }

    public has_point(point: Vector2) {
        return (
            point.x - this.offset.x > 0 && point.x - this.offset.x < this.size.x
        ) && (
            point.y - this.offset.y > 0 && point.y - this.offset.y < this.size.y
        )
    }
    
}