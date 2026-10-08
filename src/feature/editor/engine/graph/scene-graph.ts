import { ConnectionSceneData, NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { TypeSpecRegistry } from "../type-registry";
import { ConnectionManager } from "./connection-manager";
import { NodeInstance, SlotInstance } from "./node-instance";
import { NodeManager } from "./node-manager";

export class SceneGraph {
    public readonly registry: TypeSpecRegistry;

    private _nodes: NodeManager;
    private _connections: ConnectionManager;

    constructor(registry: TypeSpecRegistry) {
        this.registry = registry;
        this._nodes = new NodeManager();
        this._connections = new ConnectionManager(registry);
    }

    public resetGraph(): void {
        this._connections.clear();
        this._nodes.clear();
    }

    // Node Manipulation

    public removeNode(nodeId: string): boolean {
        const node = this._nodes.remove(nodeId);
        if (!node) {
            return false;
        }

        const attachedConnections = this._connections.getByNode(nodeId);
        for (const conn of attachedConnections) {
            this.disconnect(conn.uid);
        }

        return true;
    }

    public addNode(node: NodeInstance): void {
        this._nodes.add(node);
    }

    // Connection Manipulation

    public connectSlots(
        fromSlot: SlotInstance,
        toSlot: SlotInstance,
        connUid?: string
    ): ConnectionSceneData | undefined {
        return this._connections.connectSlots(fromSlot, toSlot, connUid);
    }

    public addConnection(
        connData: ConnectionSceneData
    ): ConnectionSceneData | undefined {
        return this.connect(
            connData.from_slot.node_id,
            connData.from_slot.slot_id,
            connData.to_slot.node_id,
            connData.to_slot.slot_id,
            connData.uid
        );
    }

    public connect(
        fromNodeId: string,
        fromSlotId: string,
        toNodeId: string,
        toSlotId: string,
        connUid?: string
    ): ConnectionSceneData | undefined {
        const fromNode = this._nodes.get(fromNodeId);
        const toNode = this._nodes.get(toNodeId);

        if (!fromNode || !toNode) {
            return undefined;
        }

        const fromSlot = fromNode.get_slot(fromSlotId);
        const toSlot = toNode.get_slot(toSlotId);

        if (!fromSlot || !toSlot) {
            return undefined;
        }

        return this.connectSlots(fromSlot, toSlot, connUid);
    }

    public disconnect(connId: string): boolean {
        const conn = this._connections.remove(connId);
        if (!conn) {
            return false;
        }

        const fromNode = this._nodes.get(conn.from_slot.node_id);
        const toNode = this._nodes.get(conn.to_slot.node_id);
        if (!fromNode || !toNode) {
            return true;
        }

        const fromSlot = fromNode.get_slot(conn.from_slot.slot_id);
        if (fromSlot) {
            fromSlot.connection_count = Math.max(0, fromSlot.connection_count - 1);
        }

        const toSlot = toNode.get_slot(conn.to_slot.slot_id);
        if (toSlot) {
            toSlot.connection_count = Math.max(0, toSlot.connection_count - 1);
        }

        return true;
    }

    // Node and Connection Getters

    public getNodesAsData(): Record<string, NodeSceneData> {
        return this._nodes.getAsData();
    }

    public getConnsAsData(): Record<string, ConnectionSceneData> {
        return this._connections.getAsData();
    }

    public ensureNode(nodeId: string): NodeInstance {
        return this._nodes.ensure(nodeId);
    }

    public getNode(nodeId: string): NodeInstance | undefined {
        return this._nodes.get(nodeId);
    }

    public getConnection(connectionUid: string): ConnectionSceneData | undefined {
        return this._connections.get(connectionUid);
    }

    public getNodeConnections(nodeId: string): ConnectionSceneData[] {
        return this._connections.getByNode(nodeId);
    }

    public get allNodes(): Record<string, NodeInstance> {
        return this._nodes.all();
    }

    public get allConnections(): Record<string, ConnectionSceneData> {
        return this._connections.all();
    }

    // Validation Utility

    public nodesExist(nodeUids: string[]): boolean {
        return nodeUids.every((uid) => uid in this._nodes.nodeIndex);
    }
}
