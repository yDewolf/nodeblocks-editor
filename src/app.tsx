import "~/app.css";

import { Router, Route, Navigate } from "@solidjs/router";
import SceneEditor from "./feature/editor/scene-editor-route";
import { AppSessionProvider } from "./network/app-session-provider";
import { createEffect, onCleanup, onMount } from "solid-js";
import { _setSetupComplete, UpdateRootDataTheme } from "./feature/app-settings";
import { ContextMenuPortal } from "./feature/context-menu/context-menu-component";
import { Home } from "./feature/home/home-route";
import { ScenesRoute } from "./feature/home/scenes/scenes-view";
import { PackageManagerProvider } from './feature/editor/contexts/package-manager-context';
import DocsRoute from "./feature/docs/docs-route";
import { SettingsRoute } from "./feature/home/settings/settings-route";
import { SetupScreen } from "./feature/setup/setup-route";
import { I18nProvider, useI18n } from "./i18n/i18n-context";
import { localServerController } from "./network/api/local-server-controller";
import { AppSettingsContent } from "./feature/home/settings/app-settings-view";
import { EditorSettingsContent } from "./feature/editor/screens/settings-view";
import { LocalServerSettingsContent } from "./feature/local-server/local-server-settings";
import { RemoteServerSettingsContents } from "./feature/remote-server/remote-server-config";
import { syncAppSettingsWithTauri } from "./feature/app-settings-sync";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { releaseController } from "./network/api/github/github-release-controller";
import { UIAlertOverlay } from "./feature/alerts/ui-alert-overlay";
import { alertController } from "./feature/alerts/ui-alert-controller";

declare global {
  interface Window {
    isTauriEnvironment?: boolean;
  }
}

export default function App() {
  onMount(async () => {
    await syncAppSettingsWithTauri();
    
    await localServerController.checkIsInstalled();
    if (localServerController.isInstalled) {
      await localServerController.checkStatus();
    }

    if (window.isTauriEnvironment) {
      const appWindow = getCurrentWindow();
      const unlisten = await appWindow.onCloseRequested(() => {
        localServerController.onWindowClose();
      });
  
      onCleanup(() => {
          unlisten();
      });
    };
  });

  onCleanup(() => {
    localServerController.cleanup()
  })

  createEffect(() => {
    UpdateRootDataTheme();
  });

  return (
    <I18nProvider>
      <AppSetup/>
    </I18nProvider>
  );
}


const AppSetup = () => {
  const {t} = useI18n();
  onMount(() => {
    if (localServerController.installedVersion && localServerController.isInstalledVersionIncompatible) {
      alertController.warning(
        t("uiAlerts.localServer.incompatibleInstalledVersion"), 
        t("uiAlerts.localServer.incompatibleVersionTitle"),
        0, 
        {label: t("uiAlerts.localServer.gotoSetupAction"), onclick: () => {
          _setSetupComplete(false);
      }});
    }
  });

  return (
    <AppSessionProvider>
      <SetupScreen>
        <PackageManagerProvider>
          <main>
            <UIAlertOverlay/>
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
  )
}