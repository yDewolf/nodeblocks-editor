import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

interface AppSettings {
    serverHost: string,
    serverPort: number
}

const [appSettings, _setAppSettings] = makePersisted(
    createStore<AppSettings>({
        serverHost: "http://localhost",
        serverPort: 8080
    }), 
    {name: "app-settings"}
);

export { appSettings }
