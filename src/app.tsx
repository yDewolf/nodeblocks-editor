import { PackageManager } from "./feature/editor/engine/packages/package-manager";
import { TypeSpecRegistry } from "./feature/editor/engine/type-registry";
import { SceneConnectionManager } from "./feature/editor/network/scene-connection-manager";
import { AppSessionManager } from "./network/app-session-manager";
import { CommandGroups, ExecutionShortcuts, SceneExecutionCmdTypes } from "./protocols/nodeblocks/network/client-command-protocol";

async function connectToScene(scene_id: string) {
  
}

export default function App() {
  const appSession = new AppSessionManager("localhost", 8080);
  let sceneConnection: SceneConnectionManager | null = null;
  appSession.login("test_user").then(() => {
    const registry = new TypeSpecRegistry();
    const packageManager = new PackageManager(registry);
  
    sceneConnection = new SceneConnectionManager(appSession, packageManager);
    sceneConnection.connect("test_scene");
  });

  return (
    <main>
      <button onclick={() => {
        sceneConnection?.sendCommand({cmd_group: CommandGroups.EXECUTION, cmd_uid: "test_command", type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT, shortcut: ExecutionShortcuts.EXECUTION_STEP})
      }}>
        Step
      </button>
    </main>
  );
}
