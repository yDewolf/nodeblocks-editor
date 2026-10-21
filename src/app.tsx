import { createEffect, createSignal, onMount, Show } from "solid-js";
import { PackageManager } from "./feature/editor/engine/packages/package-manager";
import { TypeSpecRegistry } from "./feature/editor/engine/type-registry";
import { AppSessionManager } from "./network/app-session-manager";
import { EditorProvider, useEditor } from './feature/scene-editor-context';
import { DefinedInputScope, InputManagerProvider, InputScope } from './utils/keybinds/input-provider';
import { EventManagerProvider } from './utils/events/event-provider';
import { EditorView } from "./feature/editor/editor-view";
import { UpdateRootDataTheme } from "./feature/ui-themes";
import { ClientSceneCommandTypes, CommandGroups } from "./protocols/nodeblocks/network/client-command-protocol";
import { nanoid } from "nanoid";
import { MetadataProvider, MetaProvider } from "./feature/metadata/metadata-context";
import { DocsProvider, DocsUrlSync } from './feature/docs/docs-context';

interface AppContextData {
  appSession: AppSessionManager,
  packageManager: PackageManager // This shouldn't be here
}

export default function App() {
  const [context, setContext] = createSignal<AppContextData | null>(null);

  onMount(async () => {
    try {
      const appSession = new AppSessionManager("localhost", 8080);
      await appSession.login("test_user");

      const registry = new TypeSpecRegistry();
      const packageManager = new PackageManager(registry);
      setContext({ appSession, packageManager });
    } catch (error) {
      console.error("[App] Failed during initialization:", error);
    }
  });

  createEffect(() => {
      UpdateRootDataTheme();
  });

  return (
    <main>
      <Show 
        when={context()} 
        fallback={<div>Connecting...</div>}
      >
        {(context_data) => (
          <EditorProvider packageManager={context_data().packageManager} appSession={context_data().appSession}>
            <TestComponent />
          </EditorProvider>
        )}
      </Show>
    </main>
  );
}

const TestComponent = () => {
  const editor = useEditor();
  const [targetScene, setTargetScene] = createSignal<string | null>(null);
  onMount(async () => {
    await editor.connectToScene("test_scene");
    editor.sceneConnection.sendCommand({
      cmd_uid: nanoid(),
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