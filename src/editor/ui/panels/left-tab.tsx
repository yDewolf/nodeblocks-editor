import { Accessor, createSignal, onCleanup, Show } from "solid-js";
import { ToolController } from "~/editor/controllers/tool-controller";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeTypeSelector } from "../misc/node-type-selector";
import { NodePreview } from "../misc/node-preview";


export const EditorLeftTab = (props: {selector: NodeTypeSelector, scene_controller: SceneController, tool_controller: ToolController}) => {
    const [show, setShow] = createSignal(false);
    
    return (
        <Show
            when={show()}
            fallback={
                <div class="left-tab-modal column-row">
                    <span>Nodes</span>
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => setShow(true)}>
                        <img src="assets/icons/left-tab.svg" alt="Open" />
                    </button>
                </div>
            }
        >
            <div class="left-tab">
                <div class="button-tab column-row">
                    <ul class="tabs">
                        <li class="tab-item">
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
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onclick={(e) => setShow(false)}>
                        <img src="assets/icons/left-tab.svg" alt="Close" />
                    </button>
                </div>
                
                {props.selector.View(props.scene_controller, (node_preview: NodePreview) => props.tool_controller.current_tool?.onClickOnNodePreview(node_preview))}
            </div>
        </Show>
    )
}