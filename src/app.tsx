import { createSignal, onMount, Show } from "solid-js";
import { ActionController } from "./feature/editor/actions/action-controller";
import { AddNodesAction } from "./feature/editor/actions/node/add-nodes-action";
import { NodeScene } from "./feature/editor/engine/node_scene";
import { PackageManager } from "./feature/editor/engine/packages/package-manager";
import { PackageNodeProvider } from "./feature/editor/engine/providers/package-node-provider";
import { TypeSpecRegistry } from "./feature/editor/engine/type-registry";
import { SceneConnectionManager } from "./feature/editor/network/scene-connection-manager";
import { SceneProvider } from "./feature/scene/scene-context";
import { AppSessionManager } from "./network/app-session-manager";
import { ClientSceneCommandTypes, CommandGroups, ExecutionShortcuts, SceneExecutionCmdTypes } from "./protocols/nodeblocks/network/client-command-protocol";
import { SceneCanvasProvider } from "./feature/scene/scene-canvas-context";
import { TestSceneDisplayer } from "./feature/scene/components/node/test-scene-displayer";
import { ServerCmdResponseTypes, ServerMessageTypes } from "./protocols/nodeblocks/network/server-message-protocol";
import { nanoid } from "nanoid";
import { SceneEditor } from "./feature/editor/scene-editor";
import { EditorProvider, useEditor } from './feature/scene-editor-context';
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

  return (
    <SceneProvider 
      scene={editor.scene} 
      actionController={editor.actionController}
    >
      <div class="container">
        <input type="text" onchange={(event) => {setTargetScene(event.target.value)}}/>
        <button onclick={() => {
          const scene_id = targetScene();
          if (scene_id) {
            editor.sceneConnection.connect(scene_id);
          }
        }}>
          Connect
        </button>
      </div>
      <button onClick={() => {
        editor.sceneConnection.sendCommand({
          cmd_group: CommandGroups.EXECUTION,
          cmd_uid: "test_command",
          type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT,
          shortcut: ExecutionShortcuts.EXECUTION_STEP
        });
      }}>
        Step
      </button>

      <button onClick={() => {
        editor.actionController.dispatch(new AddNodesAction({
          "test_0": {
            uid: "test_0", 
            nodetype_fqn: "test_plugin:TestNode", 
            position: { x: 0, y: 0 }, 
            data: {}
          }
        }, editor.packageManager.registry));
      }}>
        Create node
      </button>
      <button onClick={() => {
        editor.sceneConnection.sendCommand({
          cmd_group: CommandGroups.SCENE, type: ClientSceneCommandTypes.GET_SCENE_DATA, cmd_uid: nanoid(4)
        })
      }}>
        Get Scene
      </button>

      <SceneCanvasProvider>
        <TestSceneDisplayer />
      </SceneCanvasProvider>
    </SceneProvider>
  )
}