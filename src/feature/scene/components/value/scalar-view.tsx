import { NDArrayView } from "~/protocols/nodeblocks/utils/ndarray_view";
import { DataTypeValuePack } from "./datatype-value-view";
import { createMemo } from "solid-js";

export const ScalarView = (props: { output_value?: DataTypeValuePack }) => {
    let value = createMemo(() => {
        if (props.output_value && props.output_value.value instanceof NDArrayView) {
            let indices = [];
            for (let i = 0; i < props.output_value.value.shape.length; i++) {
                indices.push(0);
            }
            return props.output_value.value.get(...indices);
        }
        return props.output_value?.value
    });
    return (
        <span class="node-output output-text">
            {String(value())}
        </span>
    )
};
