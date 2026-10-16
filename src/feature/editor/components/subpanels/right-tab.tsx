import { createMemo, createSignal, For, JSXElement, Show } from "solid-js"
import { DropdownSection } from "../../../../components/panels/dropdown"
import { TabSelector } from "../../../../components/panels/tab-display"
import { ScenePanel } from "./component/server-panel"
import { NodeAttributes } from "./component/node-attributes"
import { SceneNode } from "~/feature/scene/objects/scene-node"
import { useEditor } from "~/feature/scene-editor-context"
import { useNotifications } from "../../contexts/notification-context"
import { BaseNotification, SidebarNotifications } from "../notification-badges"

const NotificationLog = (props: {node?: SceneNode}) => {
    const notificationController = useNotifications();
    
    const all_notifications = createMemo(() => [...notificationController.forAll(),]);
    const notifications = createMemo(() => {
        if (props.node) {
            return notificationController.relatedToNode(props.node);
        }

        return all_notifications();
    })

    return (
        <div class="fill container scrollable">
            <div class="fill container notification-log">
                <For each={notifications()}>
                    {(notification) => {
                        return <BaseNotification notification={notification}/>
                    }}
                </For>
            </div>
        </div>
    )
}

export const EditorRightPanel = () => {
    const editor = useEditor();
    const [expanded, setExpanded] = createSignal(false);

    const selectedNode = createMemo<SceneNode | undefined>(() => {
        const node = editor.selectionController.selected_nodes.at(-1);
        setExpanded(node != undefined);
        return node;
    });

    const tabs: Record<string, () => JSXElement> = {
        "Attributes": () => <NodeAttributes node={selectedNode()}/>
    }
    
    const bottom_tabs: Record<string, () => JSXElement> = {
        "Notifications": () => <NotificationLog node={selectedNode()}/>,
        "History": () => <NotificationLog/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    const [selectedTab1, setSelectedTab1] = createSignal<string>(Object.keys(bottom_tabs).at(0) ?? "");
    return (
        <div class="right-tab-holder" docs-id="editor-right-tab" docs-root="builtin">
            <DropdownSection
                expanded_states={[expanded, setExpanded]}
                dropdown_class="right-tab-dropdown"                
                header_class="right-tab-header"
                body_class="right-tab-content"
                icon_class="medium-icon"
                no_button={true}
                header_content={() => {
                    return (
                        <ScenePanel state_controller={editor.stateController}/>
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
                <SidebarNotifications/>
            </Show>
        </div>
    )
}