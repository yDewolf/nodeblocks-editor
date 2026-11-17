import { NDArrayView } from "~/protocols/nodeblocks/utils/ndarray_view";
import { DataTypeValuePack } from "./datatype-value-view";

export const ScalarView = (props: { output_value?: DataTypeValuePack }) => {
    let value = props.output_value?.value;
    if (props.output_value && props.output_value.value instanceof NDArrayView) {
        value = props.output_value.value.get(0);
    }
    return (
        <span class="node-output output-text">
            {String(value)}
        </span>
    )
};
