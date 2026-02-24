import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import { Rect, Vector2 } from '../../data_types/geometry';
import { EditorCamera } from '../editor/editor-space';
import { NodeSlot } from './node-slot';

export class BaseNode {
    id: number;
    node_name: string;
    // Usamos signals para que a UI saiba quando atualizar
    private raw_pos: Vector2;

    private inputs: NodeSlot[] = [new NodeSlot()];
    private outputs: NodeSlot[] = [new NodeSlot()];

    private _pos: () => Vector2;
    private _setPos: (v: Vector2) => void;

    private _selected: () => boolean;
    private _setSelected: (v: boolean) => void;

    private _size: () => Vector2;
    private _setSize: (v: Vector2) => void;

    constructor(node_name: string, position: Vector2, id: number = -1) {
        this.id = id;
        this.node_name = node_name;
        this.raw_pos = position;

        const [pos, setPos] = createSignal(position);
        this._pos = pos;
        this._setPos = setPos;

        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._setSelected = setSelected;

        const [size, setSize] = createSignal({ x: 100, y: 150 });
        this._size = size;
        this._setSize = setSize;
    }
    
    get x() { return this._pos().x }
    get y() { return this._pos().y }
    get pos() { return this._pos() }

    get width() { return this._size().x; }
    get height() { return this._size().y; }

    public updateSize(width: number, height: number) {
        if (width == 0 && height == 0) {
            return;
        }

        if (this.width !== width || this.height !== height) {
            this._setSize({ x: width, y: height });
        }
    }

    get rect() {
        return new Rect(this.pos, this._size());
    }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._setSelected(value) }

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

    }

    public get_relative_pos(camera_offset: Vector2) {
        return { x: (this.x - camera_offset.x), y: (this.y - camera_offset.y) };
    }

    public View(camera: EditorCamera, onClick: (node: BaseNode) => void) {
        let ro: ResizeObserver | undefined;
        const handleRef = (el: HTMLDivElement) => {
            const rect = el.getBoundingClientRect();
            this.updateSize(rect.width / camera.zoom, rect.height / camera.zoom);

            ro = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    this.updateSize(
                        entry.contentRect.width, 
                        entry.contentRect.height
                    );
                }
            });
            ro.observe(el);
        };

        onCleanup(() => ro?.disconnect());

        const isVisible = createMemo(() => {
            return camera.camera_rect.overlaps(this.rect);
        });

        return (
            <Show when={isVisible()}>
                <div 
                    ref={handleRef}
                    style={{
                        position: "absolute",
                        transform: `translate(${this.x}px, ${this.y}px)`,
                        // "pointer-events": "none"
                    }}
                >
                    <div class="node-slots">
                        <div class="slots-column inputs">
                            <For each={this.inputs}>
                                {(slot) => slot.View()}
                            </For>
                        </div>

                        <div class="slots-column outputs">
                            <For each={this.outputs}>
                                {(slot) => slot.View()}
                            </For>
                        </div>
                    </div>
                     <div
                        class="internal-node"
                        data-node-id={this.id}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                            onClick(this);
                        }}
                        classList={{
                            "selected-mode": this.selected
                        }}
                    >
                        <div class="node-body">
                            <div class="node-header">{this.node_name}</div>
                            
                            <div class="node-content">
                                <div style={{display: "flex"}}>
                                    <label>test</label>
                                    <input type="text" />
                                </div>
                                <div class="node-internal-data"> ... </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        );
    }
}
