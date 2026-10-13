import { createContext, useContext, ParentComponent, onMount, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { useScene } from "./scene-context";
import { SceneNode } from "./objects/scene-node";
import { CanvasSpace } from '../editor/canvas/editor-space';
import { SceneConnection } from "./objects/scene-connection";
import { CanvasElementController } from "./controllers/canvas-element-controller";

interface SceneCanvasStore {
    nodes: Record<string, SceneNode>
    conns: Record<string, SceneConnection>
}

interface SceneCanvasContextValue {
    nodes: Record<string, SceneNode>
    conns: Record<string, SceneConnection>
    canvasSpace: CanvasSpace
    elementController: CanvasElementController
}

const SceneCanvasContext = createContext<SceneCanvasContextValue>();
export const SceneCanvasProvider: ParentComponent<{
    canvasSpace?: CanvasSpace
}> = (props) => {
    const { scene } = useScene();
    const [canvasStore, setCanvasStore] = createStore<SceneCanvasStore>({
        nodes: {},
        conns: {},
    });

    onMount(() => {
        let nodes: Record<string, SceneNode> = {};
        for (const [uid, instance] of Object.entries(scene.graph.allNodes)) {
            nodes[uid] = new SceneNode(instance);
        }
        setCanvasStore("nodes", nodes);

        let conns: Record<string, SceneConnection> = {};
        for (const [uid, conn] of Object.entries(scene.graph.allConnections)) {
            const output_slot = nodes[conn.from_slot.node_id].slots[conn.from_slot.slot_id];
            const input_slot = nodes[conn.to_slot.node_id].slots[conn.to_slot.slot_id];
            conns[uid] = new SceneConnection(conn, input_slot, output_slot);
        }
        setCanvasStore("conns", conns);

        const unsubscribe = scene.subscribe((event) => {
            if (event.type === "node_added") {
                setCanvasStore("nodes", event.node.uid, new SceneNode(event.node));
            
            } else if (event.type === "node_removed") {
                setCanvasStore("nodes", event.node_id, undefined as any);

            } else if (event.type === "conn_added") {
                const output_slot = nodes[event.conn.from_slot.node_id].slots[event.conn.from_slot.slot_id];
                const input_slot = nodes[event.conn.to_slot.node_id].slots[event.conn.to_slot.slot_id];
                
                setCanvasStore("conns", event.conn.uid, 
                    new SceneConnection(event.conn, input_slot, output_slot)
                );

            } else if (event.type === "conn_removed") {
                setCanvasStore("conns", event.conn_id, undefined as any);
            }
        });

        onCleanup(() => unsubscribe());
    });
    
    const canvasSpace = props.canvasSpace ?? new CanvasSpace();
    const elementController = new CanvasElementController(canvasStore.nodes, canvasStore.conns);
    const value: SceneCanvasContextValue = {
        get nodes() { return canvasStore.nodes; },
        get conns() { return canvasStore.conns; },
        canvasSpace,
        elementController
    };

    return (
        <SceneCanvasContext.Provider value={value}>
            {props.children}
        </SceneCanvasContext.Provider>
    );
};

export const useSceneCanvas = () => useContext(SceneCanvasContext)!;