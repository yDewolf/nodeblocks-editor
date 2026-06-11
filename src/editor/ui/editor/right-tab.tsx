import { StateController } from "~/network/controllers/state_controller"
import { NodeEditor } from "~/editor/node-editor"
import { createMemo, createSignal, For, JSXElement, Show } from "solid-js"
import { BaseNotification, NotificationCard, SidebarNotifications } from "./components/misc/notification/notification-badges"
import { session_controller } from "~/singletons/user_session"
import { GraphNode } from "~/wrapper/nodes/graph-node"
import { DropdownSection } from "../components/panels/dropdown"
import { TabSelector } from "../components/panels/tab-display"
import { ServerPanel } from "./subpanels/server-panel"
import { NodeAttributes } from "./subpanels/node-attributes"

const NotificationLog = (props: {node_uid?: string}) => {
    const notification_controller = session_controller.notification_controller;
    
    const all_notifications = createMemo(() => [...notification_controller.forAll(),]);
    const notifications = createMemo(() => {
        if (props.node_uid) {
            return notification_controller.forNode(props.node_uid);
        }

        return all_notifications();
    })

    return (
        <div class="fill container scrollable">
            <div class="fill container notification-log">
                <For each={notifications()}>
                    {(notification) => {
                        return <BaseNotification notification={notification} notification_controller={notification_controller}/>
                    }}
                </For>
            </div>
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

    const bottom_tabs: Record<string, () => JSXElement> = {
        "Notifications": () => <NotificationLog node_uid={selectedNode()?.id}/>,
        "History": () => <NotificationLog/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    const [selectedTab1, setSelectedTab1] = createSignal<string>(Object.keys(bottom_tabs).at(0) ?? "");
    return (
        <div class="right-tab-holder" docs-id="editor-right-tab">
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
                    <div class="fill right-tab-split">
                        <TabSelector
                            selector_class="right-tab-selector"
                            tab_displayer_class=""
    
                            tabs={tabs} 
                            selected_tab={selectedTab} 
                            set_selected_tab={setSelectedTab}
                        />
                        <TabSelector 
                            selector_class="right-tab-selector"
                            tab_displayer_class="sub-displayer"
    
                            tabs={bottom_tabs} 
                            selected_tab={selectedTab1} 
                            set_selected_tab={setSelectedTab1}
                        />
                    </div>
                }
            />
            <Show when={!expanded()}>
                <SidebarNotifications notification_controller={session_controller.notification_controller}/>
            </Show>
        </div>
    )
}