import { Accessor, createRoot, createSignal, JSXElement, onCleanup, Show } from "solid-js";
import { ToolController } from "~/editor/controllers/tool-controller";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeTypePreview, NodeTypeSelector } from "./type_selector/node-type-selector";
import { Dropdown, DropdownSection, TabSelector } from './base-panels';
import { session_controller } from "~/singletons/user_session";
import { FileExplorer } from "./file/file-explorer";


export const EditorLeftTabHolder = (props: {node_type_selector: NodeTypeSelector, scene_controller: SceneController, tool_controller: ToolController}) => {
    const tabs: Record<string, () => JSXElement> = {
        "Nodes": () => props.node_type_selector.View(props.scene_controller, (node_preview: NodeTypePreview) => props.tool_controller.current_tool?.onClickOnNodePreview(node_preview)),
        "Workspace": () => <FileExplorer workspace={session_controller.user_workspace}/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="left-tab-holder">
            <DropdownSection
                icon_path="public/assets/icons/left-tab.svg"
                dropdown_class="left-tab-dropdown"                
                header_class="left-tab-header"
                body_class="left-tab-content"
                icon_class="medium-icon"
                header_content={
                    () => (
                    <div class="keep row-container">
                        <div class="keep row-container" style={{gap: 0}}>
                            <span class="icon-span">
                                <img src="public/assets/logo/placeholder-logo.png" alt="Nodeblocks" />
                            </span>
                            <Dropdown content={
                                <div>TODO</div>
                            }/>
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
