import { createResource, createRoot, createSignal, For, onMount, Show } from "solid-js";
import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { ServerMessages } from "~/network/websocket/websocket-protocol";

const FileUploader = (props: {client: NodeServerClient}) => {
    const handleUpload = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const url = new URL(`${props.client.base_http_url}/api/${props.client.user_id}/file/upload`);
            if (props.client.session_token) {
                url.searchParams.append("token", props.client.session_token);
            }
            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error("Couldn't upload file:", error);
        }
    };

    return (
        <label for="workspace-file-input" class="icon-button">
            <input class="visually-hidden" type="file" onChange={handleUpload} id="workspace-file-input" />
            <img src="assets/icons/send-file.svg" alt="Download"/>
        </label>
    );
};

export const FileExplorer = (props: {client: NodeServerClient}) => {
    const [received_files, setFiles] = createSignal(Array<{name: string, size: number, type: string}>());
    const [files, { refetch }] = createResource(async () => {
        const url = new URL(`${props.client.base_http_url}/api/${props.client.user_id}/files`);
        if (props.client.session_token) {
            url.searchParams.append("token", props.client.session_token);
        }
        
        const response = await fetch(url);
        const json_content: object = await response.json()
        setFiles(Array.from(Object.values(json_content)));
    });

    props.client.add_handler(ServerMessages.SYNC_FILES, () => {
        refetch();
    });

    const deleteFile = async (filename: string) => {
        const url = new URL(`${props.client.base_http_url}/api/${props.client.user_id}/file/delete`);
        if (props.client.session_token) {
            url.searchParams.append("token", props.client.session_token);
        }

        url.searchParams.append("filename", filename);
        const response = await fetch(url);
    };

    const downloadFile = (filename: string) => {
        const url = new URL(`${props.client.base_http_url}/api/${props.client.user_id}/file/download`);
        if (props.client.session_token) {
            url.searchParams.append("token", props.client.session_token);
        }

        url.searchParams.append("filename", filename);
        window.open(url, "_blank")
    };
    
    onMount(() => {
        refetch();
    });
    
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
                    <button class="icon-button refresh-button" onclick={() => refetch()}>
                        <img src="assets/icons/refresh.svg" alt="Refresh"/>
                    </button>
                    <FileUploader client={props.client}/>
                </div>
            </div>
            <div class="file-list">
                <For each={received_files()} fallback={<span>No files...</span>}>
                    {(file) => 
                        <div class="file-item">
                            <span>{file.name}</span>
                            <div class="file-actions">
                                <button class="icon-button" onClick={() => downloadFile(file.name)}>
                                    <img src="assets/icons/download-file.svg" alt="Download"/>
                                </button>
                                <button class="icon-button" onClick={() => deleteFile(file.name)}>
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