import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

interface EditorSettings {
    alwaysShowSlotLabels: boolean
    autosaveScenes: boolean
}

const [editorSettings, _setEditorSettings] = makePersisted(
    createStore<EditorSettings>({
        alwaysShowSlotLabels: false,
        autosaveScenes: true
    }), 
    {name: "editor-settings"}
);

export const setAlwaysShowSlotLabels = (value: boolean) => _setEditorSettings("alwaysShowSlotLabels", value);
export const setAutosaveScenes = (value: boolean) => _setEditorSettings("autosaveScenes", value);
export { editorSettings };
