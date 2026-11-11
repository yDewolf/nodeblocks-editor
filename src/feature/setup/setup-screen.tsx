import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

type Progress = { step: string; percent: number; message: string };

export default function SetupScreen(props: { onReady: () => void }) {
  const [installed, setInstalled] = createSignal(false);
  const [installing, setInstalling] = createSignal(false);
  const [progress, setProgress] = createSignal<Progress>({ step: "", percent: 0, message: "" });

  let unlisten: UnlistenFn | undefined;
  onMount(async () => {
    unlisten = await listen<Progress>("env-setup-progress", (event) => {
      setProgress(event.payload);
    });

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

  onCleanup(() => {
    unlisten?.();
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
    <div class="container fill">
      <Show when={installed()} fallback={
          <>
            <button 
                onClick={handleInstall} 
                disabled={installing()}
            >
                {installing() ? "Installing..." : "Install local server"}
            </button>
            <progress class="fill" max="100" value={progress().percent} />
            <p>{progress().message}</p>
          </>
      }>
          <span>Local server is installed</span>
      </Show>
    </div>
  );
}