import { createContext, ParentComponent, useContext } from "solid-js";
import { SceneEditor } from "../scene-editor";
import { PackageManager } from "../engine/packages/package-manager";
import { AppSessionManager } from "~/network/app-session-manager";

const EditorContext = createContext<SceneEditor>();

export const EditorProvider: ParentComponent<{
    packageManager: PackageManager,
    appSession: AppSessionManager,
    sceneId: string
}> = (props) => {
  const editor = new SceneEditor(props.appSession, props.packageManager, props.sceneId);

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
