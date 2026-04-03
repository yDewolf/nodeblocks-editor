import { onMount } from "solid-js";
import "./app.css";
import { NodeEditor } from "./components/editor/node-editor";
import { NodeServerClient } from "./network/websocket-handler";

const editorClient = new NodeServerClient("localhost", 3001)

async function testHandleConnection() {
  try {
    const promise = await editorClient.connect("test_client");
  } catch (error) {
    console.error("Couldn't connect to server:", error);
  }
}

export default function App() {
  const node_editor = new NodeEditor(editorClient);
  onMount(() => {
    window.addEventListener("beforeunload", (e) => {
      editorClient.disconnect();
    });
  });
  testHandleConnection()
  // node_editor.scene_controller.load_scene("/data/node_scene.json", "/data/node_types.json");

  // node_editor.scene_controller.node_controller.add_new_node("Teste", {x: 200, y: 200})

  // Testar se os nodes são renderizados mesmo depois do editor ser criado
  // setInterval(() => {
  //   node_editor.node_controller.add_node("Teste", {x: Math.random() * 500, y: Math.random() * 500})
  // }, 1000)

  return (
    <main>
      {node_editor.View()}
    </main>
  );
}
