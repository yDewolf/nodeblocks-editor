import { createContext, onCleanup, onMount, ParentComponent, useContext } from "solid-js";
import { AppSessionManager } from "./app-session-manager";
import { getUserSession } from "~/server/session";
import { getActiveServerUrl } from "~/server/connected-server";


const AppSessionContext = createContext<AppSessionManager>();
export const AppSessionProvider: ParentComponent<{
    appSession?: AppSessionManager
}> = (props) => {
  const session = props.appSession ?? new AppSessionManager();
  const initialSession = getUserSession();
  session.setUserSession(initialSession);
  
  const connectToServer = async () => {
    const activeServerUrl = await getActiveServerUrl();
    const parsedUrl = new URL(activeServerUrl);

    const serverHost = parsedUrl.hostname;
    const serverPort = Number.parseInt(parsedUrl.port) || (parsedUrl.protocol === "https:" ? 443 : 80);
    
    session.tryConnectToServer(serverHost, serverPort);
  };
  
  onMount(async () => {
    if (session.isConnectedToServer) return;
    await connectToServer();
  });
  onCleanup(() => session.cleanup());

  return (
    <AppSessionContext.Provider value={session}>
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
