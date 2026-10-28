import { createSignal, JSXElement } from "solid-js";
import { PageViewer } from "~/components/page-controller";
import { useEditor } from "~/feature/editor/contexts/scene-editor-context";
import { NodeTypePreview, NodeTypeSelector } from "./component/node-type-selector";
import { DropsideItemData, Dropdown, DropsideManager, DropdownItemButton, DropdownSection, DropdownItemInput } from "~/components/panels/dropdown";
import { TabSelector } from "~/components/panels/tab-display";
import { SettingsView } from "../../screens/settings-view";
import LeftTabIcon from '~/assets/icons/left-tab.svg';
import { ClientSceneCommandTypes, CommandGroups } from "~/protocols/nodeblocks/network/client-command-protocol";
import { nanoid } from "nanoid";
import { LOCAL_DOCS_ID } from "~/feature/docs/docs-resolver";
import { editorSettings, setAutosaveScenes } from "../../editor-settings";
import { useNavigate } from "@solidjs/router";


const LeftTabDropdown = (props: {
    page_viewer: PageViewer
}) => {
    const editor = useEditor();
    const [currentItem, setCurrentItem] = createSignal<string | undefined>(undefined);
    const subsections: Map<string, DropsideItemData> = new Map([
        ["file", {
            label: "File",
            content: () => <div class="dropdown-item-grid">
                <button onclick={() => {
                    editor.sceneConnection.sendCommand({
                        cmd_uid: nanoid(),
                        cmd_group: CommandGroups.SCENE,
                        type: ClientSceneCommandTypes.SAVE_SCENE,
                    })
                }} class="dropdown-button">Save Scene</button>
                <button onclick={() => {
                    // TODO:
                }} class="dropdown-button">Load Scene</button>
                <button onclick={() => {
                    // TODO:
                }} class="dropdown-button">Export Scene</button>
            </div>
        }],
    ])
    
    const SettingsCallback = () => <SettingsView page_viewer={props.page_viewer}/>;
    const navigate = useNavigate();
    return (
        <Dropdown content={
            <div
                class="fill dropdown-item-grid"
            >
                <DropdownItemButton label="Return Home" onClick={() => {
                    navigate("/");
                }} onMouseOver={setCurrentItem(undefined)}/>
                <DropsideManager dropsides={subsections} currentItem={currentItem} setCurrentItem={setCurrentItem}/>
                <DropdownItemInput label="Autosave" inputType="checkbox" checked={editorSettings.autosaveScenes} onChange={(e) => {
                    setAutosaveScenes(e.target.checked);
                    editor.sceneConnection.sendCommand({
                        cmd_uid: nanoid(),
                        cmd_group: CommandGroups.SCENE, 
                        type: ClientSceneCommandTypes.SET_SCENE_AUTOSAVE, 
                        autosave: e.target.checked
                    })
                }} onMouseOver={setCurrentItem(undefined)}/>
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
}) => {
    const editor = useEditor();
    const tabs: Record<string, () => JSXElement> = {
        "Nodes": () => <NodeTypeSelector onClickOnPreview={
            (node_preview: NodeTypePreview) => editor.toolController.current_tool?.onClickOnNodePreview(node_preview)}
        />,
        "Workspace": () => <span>This isn't implemented yet</span>// <FileExplorer workspace={session_controller.user_workspace}/>
    }
    const [selectedTab, setSelectedTab] = createSignal<string>(Object.keys(tabs).at(0) ?? "");
    return (
        <div class="left-tab-holder" docs-id="editor-left-tab" docs-root={LOCAL_DOCS_ID}>
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
