import "~/app.css";

import { Router, Route, Navigate } from "@solidjs/router";
import SceneEditor from "./feature/editor/scene-editor-route";
import { AppSessionProvider } from "./network/app-session-provider";
import { AppSessionManager } from "./network/app-session-manager";
import { createEffect } from "solid-js";
import { UpdateRootDataTheme } from "./feature/ui-themes";
import { ContextMenuPortal } from "./feature/context-menu/context-menu-component";
import {} from "~/feature/ui-themes";

import { Home } from "./feature/home/home-route";
import { ScenesRoute } from "./feature/home/scenes/scenes-view";
import { PackageManagerProvider } from './feature/editor/contexts/package-manager-context';
import DocsRoute from "./feature/docs/docs-route";
import { SettingsRoute } from "./feature/home/settings/settings-route";
import { appSettings } from "./feature/app-settings";

const app_session = new AppSessionManager(appSettings.serverHost, appSettings.serverPort);
export default function App() {
    createEffect(() => {
      UpdateRootDataTheme();
    });

    return (
      <AppSessionProvider appSession={app_session}>
        <PackageManagerProvider>
          <main>
            <ContextMenuPortal />
            <Router>
                <Route path="/" component={Home}>
                  <Route path="" component={() => <Navigate href="/scenes" />} />
                  <Route path="scenes" component={ScenesRoute}/>
                  <Route path="docs" component={DocsRoute}/>
                  <Route path="settings" component={SettingsRoute}/>
                </Route>
                <Route path="/scene/:scene_id" component={SceneEditor} />
            </Router>
          </main>
        </PackageManagerProvider>
      </AppSessionProvider>
    );
}
