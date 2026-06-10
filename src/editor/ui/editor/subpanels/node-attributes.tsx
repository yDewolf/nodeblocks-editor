import { createMemo } from "solid-js";
import { NodeEditor } from "~/editor/node-editor";
import { NodeActionUtils } from "~/network/controllers/actions/node-actions";
import { metadata } from "~/singletons/metadata";
import { session_controller } from "~/singletons/user_session";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { VectorField } from "../../components/default-fields";
import { SimpleField, FieldValueDisplayer, FieldSection } from "../../components/input-fields";
import { NodeBodySections } from "../components/node/node-component";

export const NodeAttributes = (props: {editor: NodeEditor, node?: GraphNode}) => {
    if (!props.node) {
        return <div>Select a node</div>
    }
    const node_meta = createMemo(() => {
        if (!props.node) {
            return undefined;
        }
        return metadata.get_node_meta(props.node.type_id);
    })
    return (
        <div class="fill container scrollable">
            <span>{node_meta()?.capitalized_name ?? props.node.type_id}</span>
            <SimpleField field_name="Type" field_displayer={
                () => <FieldValueDisplayer value_element={() => <input readonly value={props.node?.type_id} id={props.node?.id + "type_id"}/>}/>
            } field_id={props.node?.id + "-type_id"}/>
            <FieldSection field_name="Position" field_displayer={
                () => <VectorField value={props.node!.pos} field_id={props.node?.id + "-pos"}/>
            }/>
            <NodeBodySections
                node_meta={node_meta()}
                node={props.node} 
                workspace={session_controller.user_workspace}
                syncParameter={(node: GraphNode, parameter: NodeParameter) => {
                    if (!props.node) return
                    NodeActionUtils.request_update_nodes([props.node], props.editor._action_controller);
                }}
            />
        </div>
    )
}
