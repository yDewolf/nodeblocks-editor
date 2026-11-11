import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

interface AppSettings {
    isSetupComplete: boolean
}

const [appSettings, _setAppSettings] = makePersisted(
    createStore<AppSettings>({
        isSetupComplete: false,
    }), 
    {name: "app-settings"}
);

export const setSetupComplete = (v: boolean) => _setAppSettings("isSetupComplete", v);
export { appSettings }
