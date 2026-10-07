import { DefaultDataTypes, BaseDataType, DefaultRenderers } from "./node-data-type";

export interface ScalarGenParams {
    value_range?: { min?: number; max?: number };
}

export interface ArrayGenParams extends ScalarGenParams {
    shape?: number[];
}

export interface TextGenParams {
    text?: string;
}

export interface DataTypeGenParams {
    scalar?: ScalarGenParams;
    array?: ArrayGenParams;
    text?: TextGenParams;
}

const generateScalarValue = (base: DefaultDataTypes, range?: { min?: number; max?: number }) => {
    let min = range?.min ?? (base === DefaultDataTypes.UINT ? 0 : -50);
    let max = range?.max ?? (base === DefaultDataTypes.FLOAT ? 50.0 : 50);

    if (base === DefaultDataTypes.UINT && min < 0) min = 0;
    if (min > max) [min, max] = [max, min];

    if (base === DefaultDataTypes.BOOLEAN) {
        return Math.random() > 0.5;
    }

    const randomValue = Math.random() * (max - min) + min;
    return base === DefaultDataTypes.FLOAT 
        ? parseFloat(randomValue.toFixed(2)) 
        : Math.floor(randomValue);
};

const generateRandomShape = (max_length: number = 4, min_value: number = 1, max_value: number = 32) => {
    const length = Math.round(Math.max(1, Math.random() * max_length));
    let shape: number[] = [];
    for (let idx = 0; idx < length; idx++) {
        shape.push(Math.max(min_value, Math.random() * max_value))
    }

    return shape;
}

const generateNDArray = (shape: number[], depth: number, base: DefaultDataTypes, range?: { min?: number; max?: number }): any => {
    if (shape.length === 0) return [];
    if (depth === shape.length - 1) {
        return Array.from({ length: shape[depth] }, () => generateScalarValue(base, range));
    }
    
    return Array.from({ length: shape[depth] }, () => generateNDArray(shape, depth + 1, base, range));
};

export function generate_datatype_random_value(
    datatype: BaseDataType,
    params?: DataTypeGenParams
): [string, any] {
    let result: any = null;
    switch (datatype.renderer) {
        case DefaultRenderers.SCALAR: {
            const config = params?.scalar;
            result = generateScalarValue(datatype.base, config?.value_range);
            break;
        }

        case DefaultRenderers.ARRAY: {
            const config = params?.array;
            const targetShape = config?.shape && config.shape.length > 0 ? config.shape : generateRandomShape();
            result = generateNDArray(targetShape, 0, datatype.base, config?.value_range);
            break;
        }

        case DefaultRenderers.TEXT: {
            const config = params?.text;
            const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
            result = config?.text !== undefined ? config.text : loremIpsum;
            break;
        }

        case DefaultRenderers.NOT_IMPLEMENTED:
        default:
            result = null;
            break;
    }

    return [datatype.type_id, result];
}