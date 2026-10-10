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
interface AppContextData {
  sceneConnection: SceneConnectionManager;
  actionController: ActionController;
  scene: NodeScene;
  registry: TypeSpecRegistry;
}

export default function App() {
  const [context, setContext] = createSignal<AppContextData | null>(null);

  onMount(async () => {
    try {
      const appSession = new AppSessionManager("localhost", 8080);
      await appSession.login("test_user");

      const registry = new TypeSpecRegistry();
      const packageManager = new PackageManager(registry);
      const scene = new NodeScene(registry, new PackageNodeProvider(packageManager));

      const sceneConnection = new SceneConnectionManager(appSession, packageManager);
      
      await sceneConnection.connect("test_scene");
      sceneConnection.onMessage(ServerMessageTypes.COMMAND_RESPONSE, (msg) => {
          if (msg.response_payload.type == ServerCmdResponseTypes.GET_SCENE_DATA) {
            if (msg.response_payload.scene_data) {
              scene.loadFromSceneData(msg.response_payload.scene_data, true);
            }
          }
      })
      const actionController = new ActionController(scene, sceneConnection);
      setContext({ sceneConnection, actionController, scene, registry });
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
          <SceneProvider 
            scene={context_data().scene} 
            actionController={context_data().actionController}
          >
            <button onClick={() => {
              context_data().sceneConnection.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: "test_command",
                type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT,
                shortcut: ExecutionShortcuts.EXECUTION_STEP
              });
            }}>
              Step
            </button>

            <button onClick={() => {
              context_data().actionController.dispatch(new AddNodesAction({
                "test_0": {
                  uid: "test_0", 
                  nodetype_fqn: "test_plugin:TestNode", 
                  position: { x: 0, y: 0 }, 
                  data: {}
                }
              }, context_data().registry));
            }}>
              Create node
            </button>
            <button onClick={() => {
              context_data().sceneConnection.sendCommand({
                cmd_group: CommandGroups.SCENE, type: ClientSceneCommandTypes.GET_SCENE_DATA, cmd_uid: nanoid(4)
              })
            }}>
              Get Scene
            </button>

            <SceneCanvasProvider>
              <TestSceneDisplayer />
            </SceneCanvasProvider>
          </SceneProvider>
        )}
      </Show>
    </main>
  );
}