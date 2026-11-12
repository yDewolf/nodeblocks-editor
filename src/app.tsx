import "~/app.css";

import { Router, Route, Navigate } from "@solidjs/router";
import SceneEditor from "./feature/editor/scene-editor-route";
import { AppSessionProvider } from "./network/app-session-provider";
import { AppSessionManager } from "./network/app-session-manager";
import { createEffect, onMount } from "solid-js";
import { UpdateRootDataTheme } from "./feature/app-settings";
import { ContextMenuPortal } from "./feature/context-menu/context-menu-component";
import { Home } from "./feature/home/home-route";
import { ScenesRoute } from "./feature/home/scenes/scenes-view";
import { PackageManagerProvider } from './feature/editor/contexts/package-manager-context';
import DocsRoute from "./feature/docs/docs-route";
import { SettingsRoute } from "./feature/home/settings/settings-route";
import { getActiveServerUrl } from "./server/connected-server";
import { SetupScreen } from "./feature/setup/setup-route";

declare global {
  interface Window {
    isTauriEnvironment?: boolean;
  }
}

const app_session = new AppSessionManager();
export default function App() {
  const connectToServer = async () => {
    const activeServerUrl = await getActiveServerUrl();
    const parsedUrl = new URL(activeServerUrl);

    const serverHost = parsedUrl.hostname;
    const serverPort = Number.parseInt(parsedUrl.port) || (parsedUrl.protocol === "https:" ? 443 : 80);
    
    app_session.tryConnectToServer(serverHost, serverPort);
  };

  onMount(async () => {
    await connectToServer();
  });

  createEffect(() => {
    UpdateRootDataTheme();
  });

  return (
    <AppSessionProvider appSession={app_session}>
      <SetupScreen>
        <PackageManagerProvider>
          <main>
            <ContextMenuPortal />
            <Router>
                <Route path="/" component={Home}>
                  <Route path="" component={() => <Navigate href="/scenes" />}/>
                  <Route path="scenes" component={ScenesRoute}/>
                  <Route path="docs" component={DocsRoute}/>
                  <Route path="settings" component={SettingsRoute}/>
                </Route>
                <Route path="/scene/:scene_id" component={SceneEditor} />
            </Router>
          </main>
        </PackageManagerProvider>
      </SetupScreen>
    </AppSessionProvider>
  );
}
