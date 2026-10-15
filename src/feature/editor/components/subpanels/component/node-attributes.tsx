import { createMemo } from "solid-js";
import { VectorField } from "../../../../../components/default-fields";
import { SimpleField, FieldValueDisplayer, FieldSection } from "../../../../../components/input-fields";
import { NodeBodySections } from "../../node/node-component";
import { SceneNode } from "~/feature/scene/objects/scene-node";

export const NodeAttributes = (props: {node?: SceneNode}) => {
    if (!props.node) {
        return <div>Select a node</div>
    }
    // const node_meta = createMemo(() => {
    //     if (!props.node) {
    //         return undefined;
    //     }
    //     return metadata.get_node_meta(props.node.type_id);
    // })
    return (
        <div class="fill container scrollable">
            {/* <span>{node_meta()?.capitalized_name ?? props.node.type_id}</span> */}
            <span>{props.node.fqn}</span>
            <SimpleField field_name="Type" field_displayer={
                () => <FieldValueDisplayer value_element={() => <input readonly value={props.node?.fqn} id={props.node?.uid + "type_id"}/>}/>
            } field_id={props.node?.uid + "-type_id"}/>
            <FieldSection field_name="Position" field_displayer={
                () => <VectorField value={props.node!.position} field_id={props.node?.uid + "-pos"}/>
            }/>
            <NodeBodySections
                node={props.node} 
            />
        </div>
    )
}
