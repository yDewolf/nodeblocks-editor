import "./app.css";
import { NodeEditor } from "./components/editor/node-editor";
import { NodeTypeFile } from "./helpers/node-type-file";

export default function App() {
  const node_editor = new NodeEditor();
  node_editor.node_controller.add_node("Teste", {x: 200, y: 200})
  
  const node_type_reader = new NodeTypeFile();
  node_type_reader.load_file("/data/node_types.json").then(
    () => {
      node_editor.node_controller.load_node_types(node_type_reader);
      console.log("loaded file", node_type_reader.node_constructors)
    }
  );
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
