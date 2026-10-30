import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

interface EditorState {
    mainCameraPos?: Vector2
    mainCameraZoom?: number
}

interface EditorStateStore {
    scenes: Record<string, EditorState>
}

const [editorState, _setEditorState] = makePersisted(
    createStore<EditorStateStore>({
        scenes: {}
    }),
    {name: "editor-state"}
);

export const createSceneState = (scene_id: string) => _setEditorState("scenes", scene_id, {})
export const setMainCameraPos = (scene_id: string, pos: Vector2) => _setEditorState("scenes", scene_id, "mainCameraPos", pos);
export const setMainCameraZoom = (scene_id: string, zoom: number) => _setEditorState("scenes", scene_id, "mainCameraZoom", zoom);
export { editorState };
