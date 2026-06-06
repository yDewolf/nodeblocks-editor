import { StateController } from "~/network/controllers/state_controller"
import { NodeEditor } from "~/editor/node-editor"
import { createMemo, createSignal, JSXElement, Show } from "solid-js"
import { SidebarNotifications } from "./components/misc/notification/notification-badges"
import { session_controller } from "~/singletons/user_session"
import { GraphNode } from "~/wrapper/nodes/graph-node"
import { NodeBodySections } from "./components/node/node-component"
import { NodeActionUtils } from "~/network/controllers/actions/node-actions"
import { NodeParameter } from "~/wrapper/nodes/data/node-data"
import { metadata } from "~/singletons/metadata"
import { FieldSection, FieldValueDisplayer, SimpleField } from '../components/input-fields';
import { VectorField } from "../components/default-fields"
import { DropdownSection } from "../components/panels/dropdown"
import { TabSelector } from "../components/panels/tab-display"
import { ServerPanel } from "./subpanels/server-panel"

const NodeAttributes = (props: {editor: NodeEditor, node?: GraphNode}) => {
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
        <div class="fill container">
            <span>{node_meta()?.capitalized_name ?? props.node.type_id}</span>
            <SimpleField field_name="Type" field_displayer={
                () => <FieldValueDisplayer value_element={() => <span>{props.node?.type_id}</span>}/>
            }/>
            <FieldSection field_name="Position" field_displayer={
                () => <VectorField value={props.node!.pos}/>
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

export const EditorRightPanel = (props: {editor: NodeEditor, state_controller: StateController}) => {
    const [expanded, setExpanded] = createSignal(false);
    const selectedNode = createMemo<GraphNode | undefined>(() => {
        const node = props.editor.selection_controller.selected_nodes.at(-1);
        setExpanded(node != undefined);
        return node;
    });
    const tabs: Record<string, () => JSXElement> = {
        "Attributes": () => <NodeAttributes editor={props.editor} node={selectedNode()}/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="right-tab-holder">
            <DropdownSection
                expanded_states={[expanded, setExpanded]}
                dropdown_class="right-tab-dropdown"                
                header_class="right-tab-header"
                body_class="right-tab-content"
                icon_class="medium-icon"
                no_button={true}
                header_content={() => {
                    return (
                        <ServerPanel editor={props.editor} state_controller={props.state_controller}/>
                    )
                }}
                content={
                    <TabSelector 
                        selector_class="left-tab-selector"
                        tab_displayer_class=""

                        tabs={tabs} 
                        selected_tab={selectedTab} 
                        set_selected_tab={setSelectedTab}
                    />
                }
            />
            <Show when={!expanded()}>
                <SidebarNotifications notification_controller={session_controller.notification_controller}/>
            </Show>
        </div>
    )
}