import { createContext, useContext, onCleanup, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { ActionController } from "../editor/actions/action-controller";
import { NodeScene } from "../editor/engine/node_scene";

interface ReadonlySceneContextValue {
    scene: NodeScene;
    isPending: (targetId: string) => boolean;
}
const ReadonlySceneContext = createContext<ReadonlySceneContextValue>();
export const ReadonlySceneProvider: ParentComponent<{
    scene: NodeScene;
}> = (props) => {
    const contextValue: ReadonlySceneContextValue = {
        get scene() { return props.scene; },
        isPending: (targetId: string) => false,
    };

    return (
        <ReadonlySceneContext.Provider value={contextValue}>
            {props.children}
        </ReadonlySceneContext.Provider>
    );
};


interface SceneContextValue extends ReadonlySceneContextValue {
    actionController: ActionController;
}

const SceneContext = createContext<SceneContextValue>();
export const SceneProvider: ParentComponent<{
    scene: NodeScene;
    actionController: ActionController;
}> = (props) => {
    const [pendingStore, setPendingStore] = createStore<Record<string, boolean>>({});
    const unsubscribe = props.actionController.subscribePending((updatedTargets) => {
        for (const targetId of updatedTargets) {
            setPendingStore(targetId, props.actionController.isEntityPending(targetId));
        }
    });

    onCleanup(() => unsubscribe());
    const contextValue: SceneContextValue = {
        get scene() { return props.scene; },
        get actionController() { return props.actionController; },
        isPending: (targetId: string) => Boolean(pendingStore[targetId]),
    };

    return (
        <SceneContext.Provider value={contextValue}>
            {props.children}
        </SceneContext.Provider>
    );
};

export const ensureScene = () => useContext(SceneContext)!;
export const useScene = () => useContext(SceneContext);

export const useSceneReadonly = () => {
    const context = useContext(ReadonlySceneContext);
    if (!context) {
        return ensureScene() as ReadonlySceneContextValue;
    }
    return context;
};
