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
import { SceneArtifactProvider } from "./contexts/artifact-context";
import { SceneArtifactHTTPController } from "~/network/api/scene-artifact-http-controller";

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
    
    const artifactController = new SceneArtifactHTTPController(appSession, sceneId);
    return (
        <Show 
            when={appSession.isAuthenticated() && isMounted()} 
            fallback={
                <div>
                    You need to authenticate to open a scene
                </div>
            }
        >
            <SceneArtifactProvider artifactController={artifactController}>
                <EditorProvider packageManager={packageManager} appSession={appSession} sceneId={sceneId}>
                        <EditorSetup sceneId={sceneId}/>
                </EditorProvider>
            </SceneArtifactProvider>
        </Show>
    )
}

const EditorSetup = (props: {sceneId: string}) => {
    const editor = useEditor();
    onMount(async () => {
        await editor.connectToScene(props.sceneId);
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