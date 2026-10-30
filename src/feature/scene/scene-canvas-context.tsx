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

    centerCamera: () => void
}

export const SceneCanvasContext = createContext<SceneCanvasContextValue>();
export const SceneCanvasProvider: ParentComponent<{
    canvasSpace?: CanvasSpace,
    elementController?: CanvasElementController,
}> = (props) => {
    const { scene } = useSceneReadonly();
    
    const canvasSpace = props.canvasSpace ?? new CanvasSpace();
    const elementController = props.elementController ?? new CanvasElementController(scene, canvasSpace.grid);

    const centerCamera = () => {
        const nodes = Object.values(elementController.nodes);
        if (nodes.length > 0) {
            let [minX, maxX] = [Infinity, -Infinity];
            let [minY, maxY] = [Infinity, -Infinity];

            for (const node of nodes) {
                const pos = node.position;
                
                minX = Math.min(minX, pos.x);
                maxX = Math.max(maxX, pos.x + node.size.x);
                minY = Math.min(minY, pos.y);
                maxY = Math.max(maxY, pos.y + node.size.y);
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const graphWidth = maxX - minX;
            const graphHeight = maxY - minY;

            const size = canvasSpace.camera.size;
            const padding = 20;

            const zoomX = (size.x - padding) / Math.max(graphWidth, 50);
            const zoomY = (size.y - padding) / Math.max(graphHeight, 50);
            
            const newZoom = Math.max(0.1, Math.min(2.0, Math.min(zoomX, zoomY)));
            canvasSpace.camera.zoom = newZoom;
            canvasSpace.camera.updateOffset({
                x: centerX - (size.x / 2) / newZoom,
                y: centerY - (size.y / 2) / newZoom
            });
        }
    }
    const value: SceneCanvasContextValue = {
        get nodes() { return elementController.nodes; },
        get conns() { return elementController.conns; },
        canvasSpace,
        elementController,
        centerCamera
    };

    return (
        <SceneCanvasContext.Provider value={value}>
            {props.children}
        </SceneCanvasContext.Provider>
    );
};

export const useSceneCanvas = () => useContext(SceneCanvasContext)!;