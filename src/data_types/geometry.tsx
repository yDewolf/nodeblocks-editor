export type Vector2 = {
    x: number,
    y: number
}

export class Rect {
    offset: Vector2
    size: Vector2

    constructor (offset: Vector2, size: Vector2) {
        this.offset = offset;
        this.size = size;
    }

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

    
    public set_size(size: Vector2) {
        this.size = size
    }

    public set_offset(offset: Vector2) {
        this.offset = offset
    }
}