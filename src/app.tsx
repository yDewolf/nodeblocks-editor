import { nanoid } from 'nanoid';
import { onMount } from "solid-js";
import "./app.css";
import { NodeEditor } from "./editor/node-editor";
import { NodeServerClient } from "./network/websocket/websocket-handler";
import { ServerMessages, WebsocketStatus } from './network/websocket/websocket-protocol';
import { setStore, storage } from './network/websocket/session-store';

const editorClient = new NodeServerClient("localhost", 3001)
const node_editor = new NodeEditor(editorClient);
const client_id: string = nanoid();

async function testHandleConnection() {
  try {
    const promise = await editorClient.connect(client_id, storage.session == "" ? undefined : storage.session);

  } catch (error) {
    console.error("Couldn't connect to server:", error);
    console.log("Loading default types")
    node_editor.scene_controller.load_scene("data/node_scene.json", "data/node_types.json");
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    editorClient.disconnect();
  });
}

export default function App() {
  onMount(() => {
    const handleUnload = () => editorClient.disconnect();
    window.addEventListener("beforeunload", handleUnload);

    editorClient.add_handler(ServerMessages.HANDSHAKE_SYNC, (msg) => {
      if (msg.status != WebsocketStatus.CONNECTED) return;
  
      if ("session" in msg) {
        setStore({"session": msg.session});
      }
    });

    testHandleConnection()
  });

  return (
    <main>
      {node_editor.View()}
    </main>
  );
}
