import { ParameterSpec } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { DataTypeFieldSelector } from "../value/datatype-field";
import { SceneNode } from "../../objects/scene-node";
import { debounce } from "~/utils/debounce-utils";
import { useScene } from "../../scene-context";
import { UpdateNodesAction } from "~/feature/editor/actions/node/update-nodes-actions";
import { NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";

export const NodeParamField = (props: {
    node: SceneNode
    parameterId: string;
    parameterSpec: ParameterSpec;
    hide_label?: boolean;
}) => {
    const { actionController } = useScene();

    const getCurrentValue = () => {
        if (props.node && props.node.parameters) {
            return props.node.parameters[props.parameterId] ?? props.parameterSpec.default;
        }
        return props.parameterSpec.default;
    };

    const debouncedSync = debounce((node: SceneNode, name: string, val: any) => {
        props.node?.setParam(name, val)
        let nodes: NodeSceneRequestData = {};
        nodes[node.uid] = {
            uid: node.uid,
            nodetype_fqn: node.fqn,
            position: node.position,
            data: node.parameters
        }
        actionController.dispatch(
            new UpdateNodesAction(nodes)
        );
    }, 250);
    const onInputValueChanged = (value: any, raw_value: any) => {
        const currentValue = getCurrentValue();
        if (value !== currentValue && props.node) {
            props.node.parameters[props.parameterId] = value;
            debouncedSync(props.node, props.parameterId, value);
        }
    };

    return <DataTypeFieldSelector 
        parameterId={props.parameterId}
        parameterSpec={props.parameterSpec}
        hide_label={props.hide_label}
        onInputValueChanged={onInputValueChanged}
        getCurrentValue={getCurrentValue}
        baseFieldId={props.node.uid}
    />
}