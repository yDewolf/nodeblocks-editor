import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

interface EditorSettings {
    alwaysShowSlotLabels: boolean
}

const [editorSettings, _setEditorSettings] = makePersisted(
    createStore<EditorSettings>({
        alwaysShowSlotLabels: false
    }), 
    {name: "editor-settings"}
);

export const setAlwaysShowSlotLabels = (value: boolean) => _setEditorSettings("alwaysShowSlotLabels", value);
export { editorSettings };
