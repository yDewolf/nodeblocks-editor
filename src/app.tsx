import { Router, Route, createAsync } from "@solidjs/router";
import { Home } from "./feature/home/home-route";
import SceneEditor from "./feature/editor/scene-editor-route";
import { AppSessionProvider } from "./network/app-session-provider";
import { AppSessionManager } from "./network/app-session-manager";
import { createEffect } from "solid-js";
import { UpdateRootDataTheme } from "./feature/ui-themes";
import { ContextMenuPortal } from "./feature/context-menu/context-menu-component";

const app_session = new AppSessionManager();
export default function App() {
    createAsync(app_session.initSession);
    createEffect(() => {
      UpdateRootDataTheme();
    });

    return (
      <AppSessionProvider appSession={app_session}>
        <main>
          <ContextMenuPortal />
          <Router>
              <Route path="/" component={Home} />
              <Route path="/scene/:scene_id" component={SceneEditor} />
          </Router>
        </main>
      </AppSessionProvider>
    );
}
