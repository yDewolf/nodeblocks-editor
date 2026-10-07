import { DefaultDataTypes, DefaultRenderers } from "~/wrapper/nodes/data/node-data-type";
import { NamespaceModel } from "../../namespace_model";


export interface DataTypeSpec extends NamespaceModel {
    base_id?: DefaultDataTypes;
    default_renderer: DefaultRenderers;
    whitelist: Array<string>;
}

// -- Parameters

export type BaseParameterSpec = {
    type: DefaultDataTypes;
    label: string;
    
    default?: any;
    required: boolean;
    
    datatype_fqn: string;
}

type NumberParameter = BaseParameterSpec & {
    min?: number
    max?: number

    step?: number
}

export type FloatParam = NumberParameter & {
    type: DefaultDataTypes.FLOAT
}

export type IntParam = NumberParameter & {
    type: DefaultDataTypes.INT | DefaultDataTypes.UINT
}

export type BooleanParam = BaseParameterSpec & {
    type: DefaultDataTypes.BOOLEAN
}


export type OptionParam = BaseParameterSpec & {
    type: DefaultDataTypes.OPTIONS
    options: Array<any>
}

export type FileParam = BaseParameterSpec & {
    type: DefaultDataTypes.FILE
    extension_filter?: Array<string>
}

// TODO: array should have shape parameters I guess
export type GenericParameterSpec = BaseParameterSpec & {
    type: DefaultDataTypes.UNKNOWN | DefaultDataTypes.CUSTOM | DefaultDataTypes.ARRAY | DefaultDataTypes.TEXT
}

export type ParameterSpec = 
    | FloatParam | IntParam | BooleanParam | OptionParam | FileParam
    | GenericParameterSpec
