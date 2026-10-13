import { createContext, useContext, ParentComponent, onMount, onCleanup } from "solid-js";
import { useScene } from "./scene-context";
import { SceneNode } from "./objects/scene-node";
import { CanvasSpace } from '../editor/canvas/editor-space';
import { SceneConnection } from "./objects/scene-connection";
import { CanvasElementController } from "./controllers/canvas-element-controller";

interface SceneCanvasContextValue {
    nodes: Record<string, SceneNode>
    conns: Record<string, SceneConnection>
    canvasSpace: CanvasSpace
    elementController: CanvasElementController
}

const SceneCanvasContext = createContext<SceneCanvasContextValue>();
export const SceneCanvasProvider: ParentComponent<{
    canvasSpace?: CanvasSpace,
    elementController?: CanvasElementController
}> = (props) => {
    const { scene } = useScene();
    
    const canvasSpace = props.canvasSpace ?? new CanvasSpace();
    const elementController = props.elementController ?? new CanvasElementController(scene);
    const value: SceneCanvasContextValue = {
        get nodes() { return elementController.nodes; },
        get conns() { return elementController.conns; },
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