import { createSignal, For, onMount, Show } from "solid-js";
import { UserWorkspace } from "~/network/session/user-workspace";
import RefreshIcon from "~/assets/icons/refresh.svg";
import DownloadIcon from "~/assets/icons/download-file.svg";
import UploadIcon from "~/assets/icons/send-file.svg";

const FileUploader = (props: {workspace: UserWorkspace}) => {
    return (
        <label for="workspace-file-input" class="icon-button">
            <input class="visually-hidden" type="file" onChange={props.workspace.upload_file} id="workspace-file-input" />
            <UploadIcon />
        </label>
    );
};

export const FileExplorer = (props: {workspace: UserWorkspace}) => {
    return (
        <div class="file-explorer" style={{"pointer-events": "auto"}}>
            <div class="file-explorer-actions keep row-container">
                <FileUploader workspace={props.workspace}/>
                <button class="icon-button refresh-button" onclick={() => props.workspace.update_files()}>
                    <RefreshIcon />
                </button>
            </div>
            <div class="file-list container scrollable">
                <For each={props.workspace.files} fallback={<span>No files...</span>}>
                    {(file) => 
                        <div class="file-item keep row-container">
                            <span>{file.name}</span>
                            <div class="file-actions keep row-container">
                                <button class="icon-button" onClick={() => props.workspace.download_file(file.name)}>
                                    <DownloadIcon />
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
    );
};