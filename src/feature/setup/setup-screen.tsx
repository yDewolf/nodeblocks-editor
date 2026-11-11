import { createSignal, onMount, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

export default function SetupScreen(props: { onReady: () => void }) {
  const [installed, setInstalled] = createSignal(false);
  const [installing, setInstalling] = createSignal(false);

  onMount(async () => {
    try {
      const isInstalled = await invoke<boolean>("check_server_installed");
      if (isInstalled) {
        setInstalled(true);
        props.onReady();
      }
    } catch (e) {
      console.error("Failed to check local installation", e);
    }
  });

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await invoke("ensure_environment");
      setInstalled(true);
      
      props.onReady();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Show when={installed()} fallback={
        <button 
            onClick={handleInstall} 
            disabled={installing()}
        >
            {installing() ? "Installing..." : "Install local server"}
        </button>
    }>
        <span>Local server is installed</span>
    </Show>
  );
}