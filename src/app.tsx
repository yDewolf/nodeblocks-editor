import "./app.css";
import { NodeEditor } from "./components/editor/node-editor";
import { NodeTypeFile } from "./helpers/node-type-file";

export default function App() {
  const node_editor = new NodeEditor();
  node_editor.scene_controller.node_controller.add_new_node("Teste", {x: 200, y: 200})
  
  node_editor.scene_controller.load_scene("/data/node_scene.json", "/data/node_types.json");
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
