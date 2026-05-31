import { Accessor, createRoot, createSignal, JSXElement, onCleanup, Show } from "solid-js";
import { ToolController } from "~/editor/controllers/tool-controller";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeTypePreview, NodeTypeSelector } from "./type_selector/node-type-selector";
import { Dropdown, DropdownSection, TabSelector } from './base-panels';
import { session_controller } from "~/singletons/user_session";
import { FileExplorer } from "./file/file-explorer";


export const EditorLeftTabHolder = (props: {node_type_selector: NodeTypeSelector, scene_controller: SceneController, tool_controller: ToolController}) => {
    const tabs: Record<string, () => JSXElement> = {
        "nodes": () => props.node_type_selector.View(props.scene_controller, (node_preview: NodeTypePreview) => props.tool_controller.current_tool?.onClickOnNodePreview(node_preview)),
        "workspace": () => <FileExplorer workspace={session_controller.user_workspace}/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="left-tab-holder">
            <DropdownSection
                icon_path="public/assets/icons/left-tab.svg"
                header_class={"left-tab-header"}
                body_class={"left-tab-content"}
                header_content={
                    () => (
                    <div class="keep row-container">
                        <div class="keep row-container">
                            <span><img src="" alt="Nodeblocks" /></span>
                            <Dropdown content={
                                <div>TODO</div>
                            }/>
                        </div>
                        NodeScene
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

export const EditorLeftTab = (props: {selector: NodeTypeSelector, scene_controller: SceneController, tool_controller: ToolController}) => {
    const [show, setShow] = createSignal(false);
    const [changingState, setChangingState] = createSignal(false);
    const delayed_set_show = (value: boolean) => {
        setChangingState(true);
        setTimeout(() => {
            setShow(value);
            setChangingState(false);
        }, 200);
    }

    return (
        <Show
            when={show()}
            fallback={
                <div class="tab-modal keep row-container side-padded space-between">
                    <span>Nodes</span>
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => setShow(true)}>
                        <img src="assets/icons/left-tab.svg" alt="Open" />
                    </button>
                </div>
            }
        >
            <div class="left-tab container modal-content" classList={{"open": show(), "closing": show() && changingState()}}>
                <div class="button-tab keep row-container" style={{height: "fit-content"}}>
                    <ul class="tabs">
                        <li>
                            <input class="visually-hidden" type="file" accept=".json" id="scene-input" onChange={
                                (e) => {
                                    if (!e.target.files) {
                                        return;
                                    }
                                    
                                    let selected_file: File = e.target.files[0];
                                    props.scene_controller.safe_change_scene_file(selected_file);
                                }
                            }/>
                            <label for="scene-input" class="icon-button no-animation">
                                <img src="assets/icons/file.svg" alt="File" title="Open Scene"/>
                            </label>
                        </li>
                    </ul>
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onclick={(e) => delayed_set_show(false)}>
                        <img src="assets/icons/left-tab.svg" alt="Close" />
                    </button>
                </div>
                
                {props.selector.View(props.scene_controller, (node_preview: NodeTypePreview) => props.tool_controller.current_tool?.onClickOnNodePreview(node_preview))}
            </div>
        </Show>
    )
}