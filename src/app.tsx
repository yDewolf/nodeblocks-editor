import "./app.css";
import { createEffect, onMount } from "solid-js";
import { NodeEditor } from "./editor/node-editor";
import { session_controller } from "./singletons/user_session";
import { UpdateRootDataTheme } from "./editor/ui/ui-themes";

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
    testHandleConnection();
    // UpdateRootDataTheme();
  });

  createEffect(() => {
      UpdateRootDataTheme();
  });

  return (
    <main>
      {node_editor.View()}
    </main>
  );
}
