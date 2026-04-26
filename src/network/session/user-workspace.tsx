import { createResource, createSignal, onMount } from "solid-js";
import { NodeServerClient } from "../websocket/websocket-handler";
import { ServerMessages } from "../websocket/websocket-protocol";

export interface WorkspaceFile {
    name: string,
    type: string,
    size: number
}

export class UserWorkspace {
    client: NodeServerClient

    private _files: () => Array<WorkspaceFile>
    private _set_files: (files: Array<WorkspaceFile>) => void;

    _refresh_files: () => void = () => {};

    constructor(client: NodeServerClient) {
        this.client = client;

        const [files, setFiles] = createSignal([]);
        this._files = files;
        this._set_files = setFiles;
        
        onMount(() => {
            const [fileResouce, { refetch }] = createResource(async () => {
                const url = new URL(`${client.base_http_url}/api/${client.user_id}/files`);
                if (client.session_token) {
                    url.searchParams.append("token", client.session_token);
                }
                
                const response = await fetch(url);
                const json_content: object = await response.json()
                this._set_files(Array.from(Object.values(json_content)));
            });
            
            this._refresh_files = refetch;
        })
        
        client.add_handler(ServerMessages.SYNC_FILES, () => {
            this._refresh_files();
        });
    }

    get files() { return this._files() }
    set files(files: Array<WorkspaceFile>) { this._set_files(files) }

    public delete_file = async (filename: string) => {
        const url = new URL(`${this.client.base_http_url}/api/${this.client.user_id}/file/delete`);
        if (this.client.session_token) {
            url.searchParams.append("token", this.client.session_token);
        }

        url.searchParams.append("filename", filename);
        const response = await fetch(url);
    }

    public  download_file = async (filename: string) => {
        const url = new URL(`${this.client.base_http_url}/api/${this.client.user_id}/file/download`);
        if (this.client.session_token) {
            url.searchParams.append("token", this.client.session_token);
        }

        url.searchParams.append("filename", filename);
        window.open(url, "_blank")
    }

    public  upload_file = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const url = new URL(`${this.client.base_http_url}/api/${this.client.user_id}/file/upload`);
            if (this.client.session_token) {
                url.searchParams.append("token", this.client.session_token);
            }
            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error("Couldn't upload file:", error);
        }
    }
}