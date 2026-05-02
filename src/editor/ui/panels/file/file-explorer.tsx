import { createSignal, For, onMount, Show } from "solid-js";
import { UserWorkspace } from "~/network/session/user-workspace";

const FileUploader = (props: {workspace: UserWorkspace}) => {
    return (
        <label for="workspace-file-input" class="icon-button">
            <input class="visually-hidden" type="file" onChange={props.workspace.upload_file} id="workspace-file-input" />
            <img src="assets/icons/send-file.svg" alt="Download"/>
        </label>
    );
};

export const FileExplorer = (props: {workspace: UserWorkspace}) => {
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
                <div class="tab-modal keep row-container space-between side-padded">
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => setShow(true)}>
                        <img src="assets/icons/menu.svg" alt="Open" />
                    </button>
                    <span>Workspace</span>
                </div>
            }
        >
        
        <div class="file-explorer modal-content" classList={{"open": show(), "closing": show() && changingState()}} style={{"pointer-events": "auto"}}>
            <div class="file-explorer-actions keep row-container side-padded">
                <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => delayed_set_show(false)}>
                    <img src="assets/icons/menu.svg" alt="Open" />
                </button>
                <div class="keep row-container">
                    <button class="icon-button refresh-button" onclick={() => props.workspace.update_files()}>
                        <img src="assets/icons/refresh.svg" alt="Refresh"/>
                    </button>
                    <FileUploader workspace={props.workspace}/>
                </div>
            </div>
            <div class="file-list container padded scrollable">
                <For each={props.workspace.files} fallback={<span>No files...</span>}>
                    {(file) => 
                        <div class="file-item keep row-container">
                            <span>{file.name}</span>
                            <div class="file-actions keep row-container">
                                <button class="icon-button" onClick={() => props.workspace.download_file(file.name)}>
                                    <img src="assets/icons/download-file.svg" alt="Download"/>
                                </button>
                                <button class="icon-button" onClick={() => props.workspace.delete_file(file.name)}>
                                    X
                                </button>
                            </div>
                        </div>
                    }
                </For>
            </div>
        </div>
        </Show>
    );
};