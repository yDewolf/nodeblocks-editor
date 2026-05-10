export const ScalarView = (props: { output_value: any | undefined }) => {
    return (<span class="node-output output-text">{String(props.output_value)}</span>)
};
