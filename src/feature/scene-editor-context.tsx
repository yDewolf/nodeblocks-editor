import { createContext, ParentComponent, useContext } from "solid-js";
import { SceneEditor } from "./editor/scene-editor";
import { PackageManager } from "./editor/engine/packages/package-manager";
import { AppSessionManager } from "~/network/app-session-manager";

interface EditorContextValue {
  editor: SceneEditor;
}

const EditorContext = createContext<EditorContextValue>();

export const EditorProvider: ParentComponent<{
    packageManager: PackageManager,
    appSession: AppSessionManager
}> = (props) => {
  const editor = new SceneEditor(props.appSession, props.packageManager);

  return (
    <EditorContext.Provider value={{ editor }}>
      {props.children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context.editor;
};
