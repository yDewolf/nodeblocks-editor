import { Accessor, createRoot, createSignal, JSXElement, onCleanup, Show } from "solid-js";
import { ToolController } from "~/editor/controllers/tool-controller";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { session_controller } from "~/singletons/user_session";
import { FileExplorer } from "./subpanels/file-explorer";
import LeftTabIcon from "~/assets/icons/left-tab.svg";
import { DropsideItemData, Dropdown, DropsideManager, DropdownItemButton, DropdownSection } from "../components/panels/dropdown";
import { TabSelector } from "../components/panels/tab-display";
import { NodeTypeSelector, NodeTypePreview } from "./subpanels/node-type-selector";
import { NodeEditor } from "~/editor/node-editor";
import { PageViewer } from "../components/page-controller";
import { SettingsView } from "../screens/settings-view";

const LeftTabDropdown = (props: {
    page_viewer: PageViewer
}) => {
    const [currentItem, setCurrentItem] = createSignal<string | undefined>(undefined);
    const subsections: Map<string, DropsideItemData> = new Map([
        ["file", {
            label: "File",
            content: () => <div class="dropdown-item-grid">
                <button onclick={() => {}} class="dropdown-button">Save Scene</button>
                <button onclick={() => {}} class="dropdown-button">Load Scene</button>
            </div>
        }],
    ])
    
    const SettingsCallback = () => <SettingsView page_viewer={props.page_viewer}/>;
    return (
        <Dropdown content={
            <div
                class="fill dropdown-item-grid">
                <DropsideManager dropsides={subsections} currentItem={currentItem} setCurrentItem={setCurrentItem}/>
                <DropdownItemButton label="Settings" onClick={() => {
                    props.page_viewer.current_page = {
                        page_title: "Settings",
                        view_displayer_css: "settings-view",
                        element: SettingsCallback
                    };
                }} onMouseOver={setCurrentItem(undefined)}/>
            </div>
        }/>
    )
}

export const EditorLeftTabHolder = (props: {
    main_page_viewer: PageViewer,
    editor: NodeEditor,
    node_type_selector: NodeTypeSelector, 
}) => {
    const tabs: Record<string, () => JSXElement> = {
        "Nodes": () => props.node_type_selector.View(props.editor.scene_controller, (node_preview: NodeTypePreview) => props.editor.tool_controller.current_tool?.onClickOnNodePreview(node_preview)),
        "Workspace": () => <FileExplorer workspace={session_controller.user_workspace}/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="left-tab-holder">
            <DropdownSection
                icon={() => <LeftTabIcon class="medium-icon"/>}
                dropdown_class="left-tab-dropdown"                
                header_class="left-tab-header"
                body_class="left-tab-content"
                header_content={
                    () => (
                    <div class="keep row-container">
                        <div class="keep row-container" style={{gap: 0}}>
                            <span class="icon-span">
                                <img src="public/assets/logo/placeholder-logo.png" alt="Nodeblocks" />
                            </span>
                            <LeftTabDropdown page_viewer={props.main_page_viewer} />
                        </div>
                        <h4>
                            NodeScene
                        </h4>
                    </div>)
                }
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
        </div>
    )
}
