import { nanoid } from 'nanoid';
import { onMount } from "solid-js";
import "./app.css";
import { NodeEditor } from "./editor/node-editor";
import { NodeServerClient } from "./network/websocket/websocket-handler";
import { UserSession } from './network/session/user-session';
import { SessionController } from './network/session/session-controller';

const session_controller = new SessionController("localhost", 3001)
const node_editor = new NodeEditor(session_controller);

async function testHandleConnection() {
  try {
    const promise = await session_controller.client.connect();

  } catch (error) {
    console.error("Couldn't connect to server:", error);
    console.log("Loading default types")
    node_editor.scene_controller.load_scene("data/node_scene.json", "data/node_types.json");
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    session_controller.client.disconnect();
  });
}

export default function App() {
  onMount(() => {
    const handleUnload = () => session_controller.client.disconnect();
    window.addEventListener("beforeunload", handleUnload);
    testHandleConnection()
  });

  return (
    <main>
      {node_editor.View()}
    </main>
  );
}
