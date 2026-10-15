import { createContext, ParentComponent, useContext } from "solid-js";
import { SceneRuntimeController } from "./controllers/scene-runtime-controller";

const SceneRuntimeContext = createContext<SceneRuntimeController>();

export const SceneRuntimeProvider: ParentComponent<{ manager: SceneRuntimeController }> = (props) => {
    return (
        <SceneRuntimeContext.Provider value={props.manager}>
            {props.children}
        </SceneRuntimeContext.Provider>
    );
};

export const useSceneRuntime = () => {
    const context = useContext(SceneRuntimeContext);
    return context;
};

export const nodeHasOutput = (node_uid: string) => {
    const context = useSceneRuntime();
    if (!context) { return false; }
    
    const outputs = context.getNodeOutputs(node_uid);
    if (outputs) {
        return Object.values(outputs).length == 0;
    }
    return false;
}