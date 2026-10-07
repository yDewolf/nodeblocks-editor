import { nanoid } from "nanoid";
import { SlotInstance } from "./node-instance";
import { ConnectionSceneData, NodePathData, SlotPathData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { DuplicateConnectionError, MaxConnectionReached, IncompatibleSlotsError, ConnectionValidationError } from "../exceptions/graph-exceptions";
import { TypeSpecRegistry } from "../type-registry";

export class ConnectionManager {
    private _connections: Record<string, ConnectionSceneData> = {};
    private _registry: TypeSpecRegistry;
    private _endpointsIndex: Set<string> = new Set();

    constructor(typeRegistry: TypeSpecRegistry) {
        this._registry = typeRegistry;
    }

    public get connIndex(): Record<string, ConnectionSceneData> {
        return this._connections;
    }

    public get connections(): ConnectionSceneData[] {
        return Object.values(this._connections);
    }

    public get connIds(): string[] {
        return Object.keys(this._connections);
    }

    public clear(): void {
        this._connections = {};
        this._endpointsIndex.clear();
    }

    public connectSlots(
        fromSlot: SlotInstance,
        toSlot: SlotInstance,
        connUid?: string
    ): ConnectionSceneData {
        this.validateConnection(fromSlot, toSlot);

        const conn: ConnectionSceneData = {
            from_slot: { node_id: fromSlot.node_id, slot_id: fromSlot.slot_id },
            to_slot: { node_id: toSlot.node_id, slot_id: toSlot.slot_id },
            uid: connUid || nanoid(),
        };

        this.add(conn);

        fromSlot.connection_count += 1;
        toSlot.connection_count += 1;

        return conn;
    }

    public add(connection: ConnectionSceneData): void {
        if (connection.uid)
        if (connection.uid in this._connections) {
        throw new Error(`Another connection with uid '${connection.uid}' already exists`);
        }

        const key = this.makeEndpointKey(connection.from_slot, connection.to_slot);
        this._connections[connection.uid] = connection;
        this._endpointsIndex.add(key);
    }

    public remove(connectionUid: string): ConnectionSceneData | undefined {
        const conn = this._connections[connectionUid];
        if (conn) {
        delete this._connections[connectionUid];
        const key = this.makeEndpointKey(conn.from_slot, conn.to_slot);
        this._endpointsIndex.delete(key);
        }
        return conn;
    }

    // Getters
    public get(connectionUid: string): ConnectionSceneData | undefined {
        return this._connections[connectionUid];
    }

    public getByNode(nodeId: string): ConnectionSceneData[] {
        return Object.values(this._connections).filter(
        (conn) => conn.from_slot.node_id === nodeId || conn.to_slot.node_id === nodeId
        );
    }

    public all(): Record<string, ConnectionSceneData> {
        return this._connections;
    }

    public getAsData(): Record<string, ConnectionSceneData> {
        return this.all();
    }

    // Validation
    public validateConnection(fromSlot: SlotInstance, toSlot: SlotInstance): void {
        const key = this.makeEndpointKey(fromSlot, toSlot);
        if (this._endpointsIndex.has(key)) {
            throw new DuplicateConnectionError(
                fromSlot.node_id,
                fromSlot.slot_id,
                toSlot.node_id,
                toSlot.slot_id
            );
        }

        if (!toSlot.can_connect || !fromSlot.can_connect) {
            throw new MaxConnectionReached(
                fromSlot.node_id,
                fromSlot.slot_id,
                toSlot.node_id,
                toSlot.slot_id
            );
        }

        const areCompatible = this._registry.areTypesCompatible(
            fromSlot.spec.data_type_id,
            toSlot.spec.data_type_id
        );

        if (!areCompatible) {
            throw new IncompatibleSlotsError(
                fromSlot.node_id,
                fromSlot.slot_id,
                toSlot.node_id,
                toSlot.slot_id,
                fromSlot.spec.data_type_id,
                toSlot.spec.data_type_id
            );
        }
    }

    public canConnect(fromSlot: SlotInstance, toSlot: SlotInstance): boolean {
        try {
        this.validateConnection(fromSlot, toSlot);
        return true;
        } catch (error) {
        if (error instanceof ConnectionValidationError) {
            return false;
        }
        throw error;
        }
    }

    // Utils

    private makeEndpointKey(
        fromSlot: SlotPathData | SlotInstance,
        toSlot: SlotPathData | SlotInstance
    ): string {
        return `${fromSlot.node_id}:${fromSlot.slot_id}->${toSlot.node_id}:${toSlot.slot_id}`;
    }
}
