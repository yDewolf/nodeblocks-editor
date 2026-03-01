import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import { Rect, Vector2 } from '../../data_types/geometry';
import { EditorCamera } from '../editor/editor-space';
import { INPUT_SLOT, OUTPUT_SLOT, SuperSlotTypes } from './slot/slot-type';
import { NodeAnchor } from '../misc/node-anchors';
import { NodeConnection } from './node-connection';
import { NodeSlot } from './slot/node-slot';

export class BaseNode {
    id: number;
    node_name: string;
    // Usamos signals para que a UI saiba quando atualizar
    private raw_pos: Vector2;

    private _slots: Map<SuperSlotTypes, NodeSlot[]> = new Map<SuperSlotTypes, NodeSlot[]>;

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

        // this._add_slot(new NodeSlot(this, INPUT_SLOT));
        // this._add_slot(new NodeSlot(this, OUTPUT_SLOT));
    }
    
    get pos() { return this._pos() }
    get x() { return this.pos.x }
    get y() { return this.pos.y }

    get width() { return this._size().x; }
    get height() { return this._size().y; }

    get slots() { return this._slots; }
    get all_slots() {
        let combined: NodeSlot[] = [];
        this._slots.values().forEach((slot_array) => {
            combined = combined.concat(slot_array);
        });

        return combined;
    }

    get rect() {
        return new Rect(this.pos, this._size());
    }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._setSelected(value) }

    public updateSize(width: number, height: number) {
        if (width == 0 && height == 0) {
            return;
        }

        if (this.width !== width || this.height !== height) {
            this._setSize({ x: width, y: height });
        }
    }

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

    public get_connections() {
        let combined: NodeConnection[] = [];
        this.slots.values().forEach(slots => {
            slots.forEach((slot) => {
                combined = combined.concat(slot.raw_connections)
            })
        });

        return combined;
    }

    public _add_slot(slot: NodeSlot) {
        let target_slots = this.slots.get(slot.type.super_type);
        if (target_slots == undefined) {
            target_slots = [];
        }

        this._slots.set(slot.type.super_type, [...target_slots, slot]);
    }

    public View(
        camera: EditorCamera, 
        onClick: (node: BaseNode) => void, 
        onClickOnSlot: (slot: NodeSlot) => void, 
        onHoverNode: (node: BaseNode) => void, 
        onHoverSlot: (slot: NodeSlot) => void
    ) {
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
                    onMouseOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        onHoverNode(this);
                    }}
                    style={{
                        position: "absolute",
                        transform: `translate(${this.x}px, ${this.y}px)`,
                        // "pointer-events": "none"
                    }}
                >
                    <div class="node-slots">
                        <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={this.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                        <div class="side-anchors">
                            <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={this.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                            <div></div>
                            <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={this.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                        </div>
                        <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={this.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
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
