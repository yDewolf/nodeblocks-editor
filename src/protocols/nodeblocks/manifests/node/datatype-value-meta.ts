import { DefaultDataTypes } from "./datatype-enums"

interface BaseValueMeta {
    type: DefaultDataTypes
}

export type ArrayValueMeta = BaseValueMeta & {
    type: DefaultDataTypes.ARRAY
    shape: number[]
    
    min?: number
    max?: number
}

export type DataTypeValueMeta = ArrayValueMeta;

export interface SerializedDataTypeValue {
    value_meta?: DataTypeValueMeta
    value: any
}