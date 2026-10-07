import { DataTypeSpec } from "./node/datatype-spec";
import { NodeTypeSpec } from "./node/node-spec";


export interface PackageManifest {
    version: string;
    package_id: string;
    
    data_types: Record<string, DataTypeSpec>;
    // slot_types: Map<string, SlotTypeData>;
    node_types: Record<string, NodeTypeSpec>;
}
