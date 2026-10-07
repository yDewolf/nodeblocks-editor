import { NodeInstance } from "./node-instance";
import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

export class NodeManager {
    private _nodes: Record<string, NodeInstance> = {};

    public get nodeIndex(): Record<string, NodeInstance> {
        return this._nodes;
    }

    public get nodeInstances(): NodeInstance[] {
        return Object.values(this._nodes);
    }

    public get nodeIds(): string[] {
        return Object.keys(this._nodes);
    }

    public clear(): void {
        this._nodes = {};
    }

    public add(node: NodeInstance): void {
        if (node.uid in this._nodes) {
            throw new Error(node.uid);
        }
        this._nodes[node.uid] = node;
    }

    public remove(node_id: string): NodeInstance | undefined {
        const node = this._nodes[node_id];
        if (node) {
            delete this._nodes[node_id];
        }
        return node;
    }

    public ensure(node_id: string): NodeInstance {
        const node = this._nodes[node_id];
        if (!node) {
            throw new Error(`Node '${node_id}' doesn't exist`);
        }
        return node;
    }

    public get(nodeId: string): NodeInstance | undefined {
        return this._nodes[nodeId];
    }

    public all(): Record<string, NodeInstance> {
        return this._nodes;
    }

    public getAsData(): Record<string, NodeSceneData> {
        const dataMap: Record<string, NodeSceneData> = {};
        for (const [uid, instance] of Object.entries(this._nodes)) {
            dataMap[uid] = instance.scene_data;
        }

        return dataMap;
    }
}