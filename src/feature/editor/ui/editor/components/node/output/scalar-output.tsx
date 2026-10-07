import { SlotOutputWrapper } from "~/wrapper/nodes/slot/node-slot";

export const ScalarView = (props: { output_value: SlotOutputWrapper | undefined }) => {
    return (
        <span class="node-output output-text">
            {String(props.output_value?.value)}
        </span>
    )
};
