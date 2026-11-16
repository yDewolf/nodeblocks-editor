import { appSettings, setAutoStartLocal } from "~/feature/app-settings";
import { useSetup } from "../setup-wizard-context";
import { createSignal, Show } from "solid-js";
import { localServerController } from "~/network/api/local-server-controller";
import { useAppSession } from "~/network/app-session-provider";
import { LocalServerLogs } from "~/feature/local-server/local-server-components";

export const LocalServerSetup = () => {
    const wizard = useSetup();
    const appSession = useAppSession();

    const [testing, setTesting] = createSignal<boolean>(false);
    const handleStartLocalTest = async () => {
        if (testing()) return;
        
        setTesting(true);
        if (!localServerController.isRunning) {
            await localServerController.startServer();
        }
        const successful = await appSession.tryConnectToServer("127.0.0.1", 8080);
        setTesting(false);
    }

    return (
        <>
            <p>Before continuing, setup wizard will test the local server installation</p>
            <div class="field-grid">
                <label for="auto-start-local">Start local server on app startup</label>
                <input class="field-input" type="checkbox" id="auto-start-local"
                    checked={appSettings.autoStartLocalServer} oninput={(e) => {
                        setAutoStartLocal(e.target.checked);
                    }}
                />
            </div>
            <p class="note">You can change this later</p>
            <br />
            <button class="text-button"
                onclick={handleStartLocalTest}
                disabled={testing()}
            >
                {testing() ? "Testing Connection..." : "Run local tests"}
            </button>
            <Show when={appSession.baseHttpUrl == localServerController.localUrl && appSession.isConnectedToServer}>
                <p>Connected to server successfully. <b>You can continue now.</b></p>
            </Show>
            <LocalServerLogs/>
        </>
    );
}