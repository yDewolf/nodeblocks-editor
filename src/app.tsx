import "~/app.css";

import { Router, Route, Navigate } from "@solidjs/router";
import SceneEditor from "./feature/editor/scene-editor-route";
import { AppSessionProvider } from "./network/app-session-provider";
import { createEffect, onMount } from "solid-js";
import { appSettings, UpdateRootDataTheme } from "./feature/app-settings";
import { ContextMenuPortal } from "./feature/context-menu/context-menu-component";
import { Home } from "./feature/home/home-route";
import { ScenesRoute } from "./feature/home/scenes/scenes-view";
import { PackageManagerProvider } from './feature/editor/contexts/package-manager-context';
import DocsRoute from "./feature/docs/docs-route";
import { SettingsRoute } from "./feature/home/settings/settings-route";
import { SetupScreen } from "./feature/setup/setup-route";
import { I18nProvider } from "./i18n/i18n-context";
import { localServerController } from "./network/api/local-server-controller";
import { AppSettingsContent } from "./feature/home/settings/app-settings-view";
import { EditorSettingsContent } from "./feature/editor/screens/settings-view";
import { LocalServerSettingsContent } from "./feature/local-server/local-server-settings";
import { RemoteServerSettingsContents } from "./feature/remote-server/remote-server-config";

declare global {
  interface Window {
    isTauriEnvironment?: boolean;
  }
}

export default function App() {
  // FIXME: implementar a inicialização automática no lado do Tauri
  onMount(async () => {
    await localServerController.checkIsInstalled();
    if (localServerController.isInstalled) {
      await localServerController.checkStatus();
      if (appSettings.autoStartLocalServer && !localServerController.isRunning) {
        await localServerController.startServer();
      }
    }
  });

  createEffect(() => {
    UpdateRootDataTheme();
  });


  return (
    <I18nProvider>
      <AppSessionProvider>
        <SetupScreen>
          <PackageManagerProvider>
            <main>
              <ContextMenuPortal />
              <Router>
                  <Route path="/" component={Home}>
                    <Route path="" component={() => <Navigate href="/scenes" />}/>
                    <Route path="scenes" component={ScenesRoute}/>
                    <Route path="docs" component={DocsRoute}/>
                    <Route path="settings" component={SettingsRoute}>
                      <Route path="" component={() => <Navigate href="/settings/general" />}/>
                      <Route path="general" component={AppSettingsContent}/>
                      <Route path="editor" component={EditorSettingsContent}/>
                      <Route path="localServer" component={LocalServerSettingsContent}/>
                      <Route path="remoteServer" component={RemoteServerSettingsContents}/>
                    </Route>
                  </Route>
                  <Route path="/scene/:scene_id" component={SceneEditor} />
              </Router>
            </main>
          </PackageManagerProvider>
        </SetupScreen>
      </AppSessionProvider>
    </I18nProvider>
  );
}
