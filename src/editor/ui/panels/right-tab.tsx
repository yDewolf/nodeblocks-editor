import { StateController } from "~/network/controllers/state_controller"
import { ServerPanel } from "./server-panel"
import { NodeEditor } from "~/editor/node-editor"
import { createSignal, JSXElement } from "solid-js"
import { DropdownSection, TabSelector } from "./base-panels"
import { SidebarNotifications } from "../misc/notification/notification-badges"
import { session_controller } from "~/singletons/user_session"

export const EditorRightPanel = (props: {editor: NodeEditor, state_controller: StateController}) => {
    const tabs: Record<string, () => JSXElement> = {
        "Attributes": () => <div></div>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="right-tab-holder">
            <DropdownSection
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
            <SidebarNotifications notification_controller={session_controller.notification_controller}/>
        </div>
    )
}