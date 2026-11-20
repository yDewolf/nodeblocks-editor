import { invoke } from "@tauri-apps/api/core";
import { _setAppSettings, appSettings } from "./app-settings";


export const syncAutoStartSetting = async (): Promise<boolean> => {
    if (window.isTauriEnvironment) {
        const enabled = await invoke<boolean>("get_auto_start_local_server");
        _setAppSettings("autoStartLocalServer", enabled);
        return enabled;
    }
    return appSettings.autoStartLocalServer;
}


export const syncAppSettingsWithTauri = async () => {
    await syncAutoStartSetting();
}
