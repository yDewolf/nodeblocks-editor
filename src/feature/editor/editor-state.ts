import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { createDefaultNodeFilterState, NodeFilterState } from "./controllers/filter/node-filter-protocol";

interface EditorState {
    mainCameraPos?: Vector2
    mainCameraZoom?: number
    nodeFilterState: NodeFilterState
}

interface EditorStateStore {
    scenes: Record<string, EditorState>
    leftTabExpanded: boolean
}

const [editorState, _setEditorState] = makePersisted(
    createStore<EditorStateStore>({
        scenes: {},
        leftTabExpanded: true
    }),
    {name: "editor-state"}
);

export const createSceneState = (scene_id: string) => _setEditorState("scenes", scene_id, {
    nodeFilterState: createDefaultNodeFilterState()
});
export const setMainCameraPos = (scene_id: string, pos: Vector2) => _setEditorState("scenes", scene_id, "mainCameraPos", pos);
export const setMainCameraZoom = (scene_id: string, zoom: number) => _setEditorState("scenes", scene_id, "mainCameraZoom", zoom);
export const setLeftTabExpanded = (v: boolean) => _setEditorState("leftTabExpanded", v);
export { editorState, _setEditorState };
