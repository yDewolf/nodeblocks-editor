import "./app.css";
import { NodeEditor } from "./components/editor/node-editor";

export default function App() {
  const node_editor = new NodeEditor();
  node_editor.node_controller.add_node("Teste", {x: 200, y: 200})
  
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
