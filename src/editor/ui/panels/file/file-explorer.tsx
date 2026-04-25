import { createSignal, createResource, onMount, createEffect, For } from "solid-js";
import { NodeServerClient } from "~/network/websocket/websocket-handler";
import { ServerMessages } from "~/network/websocket/websocket-protocol";

export const FileExplorer = (props: {client: NodeServerClient}) => {
    const [files, { refetch }] = createResource(async () => {
        const url = new URL(`${props.client.base_http_url}/api/${props.client.user_id}/files`);
        if (props.client.session_token) {
            url.searchParams.append("token", props.client.session_token);
        }
        
        try {
            const response = await fetch(url);
            return await response.json();
        } catch {

        }
    });

    // Ouvinte do WebSocket para sincronização
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
    
    refetch();
    return (
        <div class="file-explorer">
            <div class="file-explorer-actions">
                <h3>Workspace</h3>
                <div class="column-row">
                    <button class="icon-button refresh-button" onclick={() => refetch()}>
                        <img src="assets/icons/refresh.svg" alt="Refresh"/>
                    </button>
                    <button class="icon-button" onclick={() => console.log("Not implemented yet")}>
                        <img src="assets/icons/send-file.svg" alt="Upload File"/>
                    </button>
                </div>
            </div>
            <div class="file-list">
                <For each={files()} fallback={<p></p>}>
                {(file) => (
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
                )}
                </For>
            </div>
        </div>
    );
};