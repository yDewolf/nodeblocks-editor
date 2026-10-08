import { createContext, useContext, ParentComponent, onMount, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { useScene } from "./scene-context";
import { SceneNode } from "./objects/scene-node";
import { ConnectionSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

interface SceneCanvasStore {
    nodes: Record<string, SceneNode>
    conns: Record<string, ConnectionSceneData>
}

interface SceneCanvasContextValue {
    nodes: Record<string, SceneNode>
    conns: Record<string, ConnectionSceneData>
}

const SceneCanvasContext = createContext<SceneCanvasContextValue>();
export const SceneCanvasProvider: ParentComponent = (props) => {
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

        let conns: Record<string, ConnectionSceneData> = {};
        for (const [uid, conn] of Object.entries(scene.graph.allConnections)) {
            conns[uid] = conn;
        }
        setCanvasStore("conns", conns);

        const unsubscribe = scene.subscribe((event) => {
            if (event.type === "node_added") {
                setCanvasStore("nodes", event.node.uid, new SceneNode(event.node));
            
            } else if (event.type === "node_removed") {
                setCanvasStore("nodes", event.node_id, undefined as any);

            } else if (event.type === "conn_added") {
                setCanvasStore("conns", event.conn.uid, event.conn);

            } else if (event.type === "conn_removed") {
                setCanvasStore("conns", event.conn_id, undefined as any);
            }
        });

        onCleanup(() => unsubscribe());
    });

    const value: SceneCanvasContextValue = {
        get nodes() { return canvasStore.nodes; },
        get conns() { return canvasStore.conns; },
    };

    return (
        <SceneCanvasContext.Provider value={value}>
            {props.children}
        </SceneCanvasContext.Provider>
    );
};

export const useSceneCanvas = () => useContext(SceneCanvasContext)!;