import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { NodeComponentV2 } from "./node-component";
import { DefaultDataTypes } from "~/protocols/nodeblocks/manifests/node/datatype-enums";

const DEFAULT_NODE_SPEC: NodeTypeSpec = {
    namespace: "preview", 
    id: "node", 
    fqn: "preview:node", 
    parameters: {
        "param_1": {
            type: DefaultDataTypes.INT,
            label: "Param 1",
            default: 0,
            required: true,
            datatype_fqn: "preview:none"
        }
    }, 
    slots: {
        "in_0": {
            datatype_fqn: "preview:none",
            required: true,
            max_connections: 1,
            is_input: true
        },
        "out_0": {
            datatype_fqn: "preview:none",
            required: false,
            max_connections: 0,
            is_input: false
        }
    }
};

export const NodePreview = (props: { 
    spec: NodeTypeSpec; 
    show_slot_labels?: boolean; 
    default_expanded?: boolean; 
}) => {
    return (
        <NodeComponentV2
            spec={props.spec}
            default_show_output={false}
            default_expanded={props.default_expanded}
            default_show_slot_labels={props.show_slot_labels ?? true} />
    );
};

export const DefaultNodePreview = (props: {
    show_slot_labels?: boolean; 
    default_expanded?: boolean; 
}) => {
    return <NodePreview spec={DEFAULT_NODE_SPEC} show_slot_labels={props.show_slot_labels} default_expanded={props.default_expanded}/>;
}