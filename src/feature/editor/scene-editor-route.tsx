import { useParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import { EditorProvider, useEditor } from "./contexts/scene-editor-context";
import { EventManagerProvider } from "~/utils/events/event-provider";
import { InputManagerProvider, DefinedInputScope } from "~/utils/keybinds/input-provider";
import { DocsProvider, DocsUrlSync } from "../docs/docs-context";
import { MetadataProvider } from "../metadata/metadata-context";
import { EditorView } from "./editor-view";
import { nanoid } from "nanoid";
import { CommandGroups, ClientSceneCommandTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { useAppSession } from "~/network/app-session-provider";
import { usePackageManager } from "./contexts/package-manager-context";

import "~/style/screens/editor.css";

export default function SceneEditor() {
    const appSession = useAppSession();
    const params = useParams<{ scene_id: string }>();
    const sceneId = params.scene_id;

    // FIXME: we might need to reset the package manager
    const packageManager = usePackageManager();
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });
    
    return (
        <Show 
            when={appSession.isAuthenticated() && isMounted()} 
            fallback={
                <div>
                    You need to authenticate to open a scene
                </div>
            }
        >
            <EditorProvider packageManager={packageManager} appSession={appSession} sceneId={sceneId}>
                <EditorSetup sceneId={sceneId}/>
            </EditorProvider>
        </Show>
    )
}

const EditorSetup = (props: {sceneId: string}) => {
    const editor = useEditor();
    onMount(async () => {
        await editor.connectToScene(props.sceneId);
        editor.sceneConnection.sendCommand({
            cmd_uid: nanoid(5),
            cmd_group: CommandGroups.SCENE,
            type: ClientSceneCommandTypes.GET_SCENE_DATA
        })
    }) 

    return (
        <MetadataProvider controller={editor.metadataController}>
            <DocsProvider controller={editor.docsController}>
                <DocsUrlSync />
                <InputManagerProvider manager={editor.inputManager}>
                    <DefinedInputScope context={editor.globalInputContext}>
                        {/* TODO adicionar um editor keybind provider */}
                        <EventManagerProvider manager={editor.eventManager}>
                            <EditorView />
                        </EventManagerProvider>
                    </DefinedInputScope>
                </InputManagerProvider>
            </DocsProvider>
        </MetadataProvider>
    )
}