import { onMount } from "solid-js";
import "./app.css";
import { NodeEditor } from "./editor/node-editor";
import { NodeServerClient } from "./network/websocket-handler";

const editorClient = new NodeServerClient("localhost", 3001)
const node_editor = new NodeEditor(editorClient);

async function testHandleConnection() {
  try {
    const promise = await editorClient.connect("test_client");
  } catch (error) {
    console.error("Couldn't connect to server:", error);
    console.log("Loading default types")
    node_editor.scene_controller.load_scene("/data/node_scene.json", "/data/node_types.json");

  }
}

export default function App() {
  onMount(() => {
    window.addEventListener("beforeunload", (e) => {
      editorClient.disconnect();
    });
  });
  testHandleConnection()

  return (
    <main>
      {node_editor.View()}
    </main>
  );
}
