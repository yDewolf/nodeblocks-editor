import { DataTypeSpec } from "./node/datatype_spec";
import { NodeTypeSpec } from "./node/node_spec";


export interface PackageManifest {
    version: string;
    package_id: string;
    
    data_types: Map<string, DataTypeSpec>;
    // slot_types: Map<string, SlotTypeData>;
    node_types: Map<string, NodeTypeSpec>;
}
 