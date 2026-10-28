import { createContext, useContext, ParentComponent, onMount, onCleanup } from "solid-js";
import { ensureScene, useSceneReadonly } from "./scene-context";
import { SceneNode } from "./objects/scene-node";
import { CanvasSpace } from './canvas/editor-space';
import { SceneConnection } from "./objects/scene-connection";
import { CanvasElementController } from "./controllers/canvas-element-controller";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

interface SceneCanvasContextValue {
    nodes: Record<string, SceneNode>
    conns: Record<string, SceneConnection>
    canvasSpace: CanvasSpace
    elementController: CanvasElementController
}

export const SceneCanvasContext = createContext<SceneCanvasContextValue>();
export const SceneCanvasProvider: ParentComponent<{
    canvasSpace?: CanvasSpace,
    elementController?: CanvasElementController,
    centeredCamera?: boolean
}> = (props) => {
    const { scene } = useSceneReadonly();
    
    const canvasSpace = props.canvasSpace ?? new CanvasSpace();
    const elementController = props.elementController ?? new CanvasElementController(scene, canvasSpace.grid);
    const value: SceneCanvasContextValue = {
        get nodes() { return elementController.nodes; },
        get conns() { return elementController.conns; },
        canvasSpace,
        elementController
    };

    if (props.centeredCamera) {
        let totalPos: Vector2 = {x: 0, y: 0}
        const nodes = Object.values(scene.graph.allNodes)
        const nodeCount = nodes.length;
        for (const node of nodes) {
            totalPos.x += node.scene_data.position.x;
            totalPos.y += node.scene_data.position.y;
        }
        const avgPos: Vector2 = {x: totalPos.x / nodeCount, y: totalPos.y / nodeCount}
        canvasSpace.camera.updateOffset(avgPos);
    }

    return (
        <SceneCanvasContext.Provider value={value}>
            {props.children}
        </SceneCanvasContext.Provider>
    );
};

export const useSceneCanvas = () => useContext(SceneCanvasContext)!;