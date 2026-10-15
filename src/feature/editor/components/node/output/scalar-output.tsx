import { DataTypeValuePack } from "./node-output";

export const ScalarView = (props: { output_value?: DataTypeValuePack }) => {
    return (
        <span class="node-output output-text">
            {String(props.output_value?.value)}
        </span>
    )
};
