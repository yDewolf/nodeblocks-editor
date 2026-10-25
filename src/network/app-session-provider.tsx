import { createContext, ParentComponent, useContext } from "solid-js";
import { AppSessionManager } from "./app-session-manager";


const AppSessionContext = createContext<AppSessionManager>();
export const AppSessionProvider: ParentComponent<{
    appSession: AppSessionManager
}> = (props) => {
  return (
    <AppSessionContext.Provider value={props.appSession}>
      {props.children}
    </AppSessionContext.Provider>
  );
};

export const useAppSession = () => {
    const context = useContext(AppSessionContext);
    if (!context) {
        throw new Error("useAppSession must be used within an AppSessionProvider");
    }
    return context;
}
