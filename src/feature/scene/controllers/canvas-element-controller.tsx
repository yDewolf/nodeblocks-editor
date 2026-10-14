import { createStore, SetStoreFunction } from "solid-js/store";
import { SceneConnection } from "../objects/scene-connection";
import { SceneNode } from "../objects/scene-node";
import { SceneNodeSlot } from "../objects/scene-slot";
import { NodeScene, SceneEvent } from "~/feature/editor/engine/node_scene";
import { Grid } from "~/feature/editor/components/canvas/grid";

interface CanvasElementStore {
    nodes: Record<string, SceneNode>
    conns: Record<string, SceneConnection>
}

export class CanvasElementController {
    private _store: CanvasElementStore
    private _setStore: SetStoreFunction<CanvasElementStore>

    private unsubscribeScene?: () => void;

    constructor(
        scene: NodeScene,
        private readonly grid: Grid
    ) {
        [this._store, this._setStore] = createStore<CanvasElementStore>({
            nodes: {},
            conns: {},
        });
        this.setup(scene);
    }

    get nodes() { return this._store.nodes; }
    get conns() { return this._store.conns; }

    public setup(scene: NodeScene) {
        let nodes: Record<string, SceneNode> = {};
        for (const [uid, instance] of Object.entries(scene.graph.allNodes)) {
            nodes[uid] = new SceneNode(instance);
        }
        this._setStore("nodes", nodes);

        let conns: Record<string, SceneConnection> = {};
        for (const [uid, conn] of Object.entries(scene.graph.allConnections)) {
            const output_slot = nodes[conn.from_slot.node_id]?.slots[conn.from_slot.slot_id];
            const input_slot = nodes[conn.to_slot.node_id]?.slots[conn.to_slot.slot_id];
            if (output_slot && input_slot) {
                const scene_conn = new SceneConnection(conn, input_slot, output_slot);
                conns[uid] = scene_conn;
            }
        }
        this._setStore("conns", conns);

        this.unsubscribeScene = scene.subscribe((event: SceneEvent) => {
            if (event.type === "node_added") {
                const scene_node = new SceneNode(event.node)
                scene_node.uiPosition = this.grid.roundPos(scene_node.position);
                this._setStore("nodes", event.node.uid, scene_node);
            
            } else if (event.type === "node_removed") {
                this._setStore("nodes", event.node_id, undefined as any);
                
                for (const [connId, conn] of Object.entries(this._store.conns)) {
                    const isConnectedToNode = 
                        conn.input_slot?.node_id === event.node_id ||
                        conn.output_slot?.node_id === event.node_id

                    if (isConnectedToNode) {
                        this._setStore("conns", connId, undefined as any);
                    }
                    this.update_anchors_from_conn(conn);
                }

            } else if (event.type === "conn_added") {
                const output_slot = this._store.nodes[event.conn.from_slot.node_id]?.slots[event.conn.from_slot.slot_id];
                const input_slot = this._store.nodes[event.conn.to_slot.node_id]?.slots[event.conn.to_slot.slot_id];
                
                if (output_slot && input_slot) {
                    const conn = new SceneConnection(event.conn, input_slot, output_slot);
                    this._setStore("conns", event.conn.uid, conn);
                    this.update_anchors_from_conn(conn);
                }

            } else if (event.type === "conn_removed") {
                const conn = this.conns[event.conn_id];
                this._setStore("conns", event.conn_id, undefined as any);
                this.update_anchors_from_conn(conn);
            }
        });
    }

    public destroy(): void {
        if (this.unsubscribeScene) {
            this.unsubscribeScene();
            this.unsubscribeScene = undefined;
        }
    }

    public update_anchors_from_conn(conn: SceneConnection) {
        const input_node = this._store.nodes[conn.input_slot.node_id];
        for (const slot of input_node.all_slots) {
            this.update_slot_anchor(slot);
        }
        const output_node = this._store.nodes[conn.output_slot.node_id];
        for (const slot of output_node.all_slots) {
            this.update_slot_anchor(slot);
        }
    }

    public update_slot_anchor(slot: SceneNodeSlot) {
        const connections = this.get_slot_connections(slot);
        if (connections.length === 0) {
            slot.anchor = slot.defaultAnchor;
            return;
        }

        const parent_node = this._store.nodes[slot.node_id];
        let average_pos = {x: 0, y: 0};

        connections.forEach(conn => {
            const other_slot = conn.input_slot == slot ? conn.output_slot : conn.input_slot; 
            const other_node = this._store.nodes[other_slot.node_id];
            average_pos.x += (other_node.position.x + other_node.size.x / 2) - (parent_node.position.x + parent_node.size.x / 2);
            average_pos.y += (other_node.position.y + other_node.size.y / 2) - (parent_node.position.y + parent_node.size.y / 2);
        });

        if (Math.abs(average_pos.x) > Math.abs(average_pos.y)) {
            slot.anchor = { x: average_pos.x > 0 ? 1 : -1, y: 0 };
            return;
        }

        slot.anchor = { x: 0, y: average_pos.y > 0 ? 1 : -1 };
    }

    public get_slot_connections(slot: SceneNodeSlot): SceneConnection[] {
        const allConns = Object.values(this._store.conns);
        return allConns.filter(conn => {
            return (
                conn.input_slot === slot || 
                conn.output_slot === slot
            );
        });
    }

    public get_slot_position = (slot: SceneNodeSlot) => {
        const parent_node = this._store.nodes[slot.node_id];
        if (!parent_node) return { x: 0, y: 0 };
        parent_node.size;

        if (!slot._element) {
            const world_pos = {
                x: parent_node.uiPosition.x + (slot.isInput == false ? parent_node.size.x : 0),
                y: parent_node.uiPosition.y + (parent_node.size.y / 2)
            };
            slot.worldPos = world_pos;
            return world_pos;
        }

        const world_pos = {
            x: parent_node.uiPosition.x + slot._element.offsetLeft + slot._element.offsetWidth / 2,
            y: parent_node.uiPosition.y + slot._element.offsetTop + slot._element.offsetHeight / 2
        }; 

        slot.worldPos = world_pos;
        return world_pos; 
    }
}