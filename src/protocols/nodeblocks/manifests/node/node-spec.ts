import { NamespaceModel } from "../../namespace-model";
import { ParameterSpec } from "./datatype-spec";

export interface NodeSlotSpec {
    data_type_id: string;
    
    // tooltip: string;
    required: boolean;
    max_connections: number;
    is_input: boolean;
}

export interface NodeTypeSpec extends NamespaceModel {
    parameters: Map<string, ParameterSpec>;
    slots: Map<string, NodeSlotSpec>;
}

