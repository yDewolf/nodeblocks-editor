import { ActionController } from "./feature/editor/actions/action-controller";
import { AddNodesAction } from "./feature/editor/actions/node/add-nodes-action";
import { NodeScene } from "./feature/editor/engine/node_scene";
import { PackageManager } from "./feature/editor/engine/packages/package-manager";
import { PackageNodeProvider } from "./feature/editor/engine/providers/package-node-provider";
import { TypeSpecRegistry } from "./feature/editor/engine/type-registry";
import { SceneConnectionManager } from "./feature/editor/network/scene-connection-manager";
import { AppSessionManager } from "./network/app-session-manager";
import { CommandGroups, ExecutionShortcuts, SceneExecutionCmdTypes } from "./protocols/nodeblocks/network/client-command-protocol";

export default function App() {
  const appSession = new AppSessionManager("localhost", 8080);
  let sceneConnection: SceneConnectionManager | null = null;
  let actionController: ActionController | null = null;

  const registry = new TypeSpecRegistry();
  const packageManager = new PackageManager(registry);
  const scene = new NodeScene(registry, new PackageNodeProvider(packageManager));

  appSession.login("test_user").then(() => {
    sceneConnection = new SceneConnectionManager(appSession, packageManager);
    sceneConnection.connect("test_scene");
    actionController = new ActionController(scene, sceneConnection);
  });

  return (
    <main>
      <button onclick={() => {
        sceneConnection?.sendCommand({cmd_group: CommandGroups.EXECUTION, cmd_uid: "test_command", type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT, shortcut: ExecutionShortcuts.EXECUTION_STEP})
      }}>
        Step
      </button>
      <button onclick={() => {
        actionController?.dispatch(new AddNodesAction({
          "test_0": {uid: "test_0", nodetype_fqn: "test_plugin:TestNode", position: {x:0, y:0}, data: {}}
        }, registry))
      }}>
        Create node
      </button>
    </main>
  );
}
