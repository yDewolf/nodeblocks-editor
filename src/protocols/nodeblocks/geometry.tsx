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

    get center() {
        return {
            x: (this.offset.x + this.size.x) / 2,
            y: (this.offset.y + this.size.y) / 2,
        }
    }

    get relative_center() {
        return {
            x: (this.size.x) / 2,
            y: (this.size.y) / 2,
        }
    }

    set offset(offset: Vector2) { this._setOffset(offset); }
    set size(size: Vector2) { this._setSize(size); }

    public overlaps(rect: Rect) {
        return !(
            (this.offset.x + this.size.x) < rect.offset.x ||
            this.offset.x > (rect.offset.x + rect.size.x) ||
            (this.offset.y + this.size.y) < rect.offset.y ||
            this.offset.y > (rect.offset.y + rect.size.y)
        )
    }

    public has_point(point: Vector2) {
        return (
            point.x >= this.offset.x &&
            point.x <= this.offset.x + this.size.x &&
            point.y >= this.offset.y &&
            point.y <= this.offset.y + this.size.y
        );
    }
    
    
    public static get_minimal_rect(rect_a: Rect, rect_b: Rect): Rect {
        const top_left = {
            x: rect_a.offset.x < rect_b.offset.x ? rect_a.offset.x : rect_b.offset.x,
            y: rect_a.offset.y < rect_b.offset.y ? rect_a.offset.y : rect_b.offset.y
        }
        const rect_a_bottom_right = {x: (rect_a.offset.x + rect_a.size.x), y: (rect_a.offset.y + rect_a.size.y)}
        const rect_b_bottom_right = {x: (rect_b.offset.x + rect_b.size.x), y: (rect_b.offset.y + rect_b.size.y)}

        const bottom_right = {
            x: rect_a_bottom_right.x > rect_b_bottom_right.x ? rect_a_bottom_right.x : rect_b_bottom_right.x, 
            y: rect_a_bottom_right.y > rect_b_bottom_right.y ? rect_a_bottom_right.y : rect_b_bottom_right.y
        }
        
        return new Rect(top_left, bottom_right);
    }
}