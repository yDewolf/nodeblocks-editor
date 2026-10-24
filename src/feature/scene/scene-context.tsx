import { createContext, useContext, onCleanup, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { ActionController } from "../editor/actions/action-controller";
import { NodeScene } from "../editor/engine/node_scene";

interface SceneContextValue {
    scene: NodeScene;
    actionController: ActionController;
    isPending: (targetId: string) => boolean;
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

export const useScene = () => useContext(SceneContext)!;
