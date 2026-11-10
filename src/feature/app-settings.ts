import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

interface AppSettings {

}

const [appSettings, _setAppSettings] = makePersisted(
    createStore<AppSettings>({
    }), 
    {name: "app-settings"}
);

export { appSettings }
