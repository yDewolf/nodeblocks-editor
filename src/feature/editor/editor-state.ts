import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

interface EditorState {
    mainCameraPos?: Vector2
    mainCameraZoom?: number
}

const [editorState, _setEditorState] = makePersisted(
    createStore<EditorState>({

    }),
    {name: "editor-state"}
);

export const setMainCameraPos = (pos: Vector2) => _setEditorState("mainCameraPos", pos);
export const setMainCameraZoom = (zoom: number) => _setEditorState("mainCameraZoom", zoom);
export { editorState };
