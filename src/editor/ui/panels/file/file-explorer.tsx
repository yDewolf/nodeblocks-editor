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
    return (
        <Show
            when={show()}
            fallback={
                <div class="left-tab-modal column-row">
                    <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => setShow(true)}>
                        <img src="assets/icons/menu.svg" alt="Open" />
                    </button>
                    <span>Workspace</span>
                </div>
            }
        >

        <div class="file-explorer" style={{"pointer-events": "auto"}}>
            <div class="file-explorer-actions">
                <button class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => setShow(false)}>
                    <img src="assets/icons/menu.svg" alt="Open" />
                </button>
                <div class="column-row">
                    <button class="icon-button refresh-button" onclick={() => props.workspace.update_files()}>
                        <img src="assets/icons/refresh.svg" alt="Refresh"/>
                    </button>
                    <FileUploader workspace={props.workspace}/>
                </div>
            </div>
            <div class="file-list">
                <For each={props.workspace.files} fallback={<span>No files...</span>}>
                    {(file) => 
                        <div class="file-item">
                            <span>{file.name}</span>
                            <div class="file-actions">
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