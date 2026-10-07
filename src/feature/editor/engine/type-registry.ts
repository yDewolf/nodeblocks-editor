import { DataTypeSpec } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { DatatypeHelper } from "./helpers/datatype-helper";

export class TypeSpecRegistry {
    public nodeTypes: Record<string, NodeTypeSpec> = {};
    public dataTypes: Record<string, DataTypeSpec> = {};

    constructor() {
        this.reset();
    }

    public reset(): void {
        this.dataTypes = {};
        this.nodeTypes = {};
    }

    
    public registerDataType(spec: DataTypeSpec): void {
        if (spec.fqn in this.dataTypes) {
        throw new Error(`DataType '${spec.fqn}' is already registered`);
        }
        this.dataTypes[spec.fqn] = spec;
    }

    public registerNodeType(spec: NodeTypeSpec): void {
        if (spec.fqn in this.nodeTypes) {
        throw new Error(`NodeType '${spec.fqn}' is already registered`);
        }
        this.nodeTypes[spec.fqn] = spec;
    }

    public areTypesCompatible(sourceType: string, targetType: string): boolean {
        const sourceSpec = this.dataTypes[sourceType];
        const targetSpec = this.dataTypes[targetType];

        if (!sourceSpec || !targetSpec) {
        return false;
        }

        return DatatypeHelper.areTypesCompatible(sourceSpec, targetSpec);
    }

    // Boolean checks:
    public isNodeTypeRegistered(nodetypeFqn: string): boolean {
        return nodetypeFqn in this.nodeTypes;
    }

    public isDataTypeRegistered(datatypeFqn: string): boolean {
        return datatypeFqn in this.dataTypes;
    }

    // Getters:
    public getNodeTypeSpec(fqn: string): NodeTypeSpec {
        if (!this.isNodeTypeRegistered(fqn)) {
        throw new Error(`No NodeTypeSpec is registered as ${fqn}`);
        }
        return this.nodeTypes[fqn];
    }

    public getDataTypeSpec(fqn: string): DataTypeSpec {
        if (!this.isDataTypeRegistered(fqn)) {
        throw new Error(`No DataTypeSpec is registered as ${fqn}`);
        }
        return this.dataTypes[fqn];
    }
}
