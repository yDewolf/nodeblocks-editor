import { createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

type Phase = "checking" | "idle" | "installing" | "installed" |  "error";

type Progress = { step: string; percent: number; message: string };

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec.toString().padStart(2, "0")}`;
}

export const LocalServerSetupContent = (props: { 
  onReady: () => void, 
  isFirstInstall?: boolean 
}) => {
  const [phase, setPhase] = createSignal<Phase>("checking");
  const [log, setLog] = createSignal<string[]>([]);
  const [error, setError] = createSignal("");
  const [elapsed, setElapsed] = createSignal(0);
  
  const [progress, setProgress] = createSignal<Progress>({ step: "", percent: 0, message: "" });

  let timer: NodeJS.Timeout | undefined;

  const handleInstall = async () => {
    setPhase("installing");
    setError("");
    setLog([]);
    setElapsed(0);
    timer = setInterval(() => setElapsed((s) => s + 1), 1000);
 
    try {
      await invoke("ensure_environment");
      setPhase("installed");
      props.onReady();
    
    } catch (e) {
      setError(String(e));
      setPhase("error");

    } finally {
      clearInterval(timer);
    }
  };

  let unlisten: UnlistenFn | undefined;
  onMount(async () => {
    unlisten = await listen<Progress>("env-setup-progress", (event) => {
      setProgress(event.payload);
      setLog((lines) => [...lines.slice(-199), event.payload.message]);
    });
 
    try {
      const is_installed = await invoke<boolean>("check_server_installed");
      if (is_installed) {
        setPhase("installed");
        props.onReady();
      } else setPhase("idle");

    } catch (e) {
      setError(String(e));
      setPhase("error");
    }
  });

  onCleanup(() => {
    unlisten?.();
  });

  return (
    <div class="text-section">
      <h2>Nodeblocks Setup</h2>
      <Switch>
        <Match when={phase() == "idle"}>
          <p>
            To run nodeblocks server locally, this installer will download its runtime (Python and <a href="https://github.com/yDewolf/nodeblocks-server">Nodeblocks Server</a>).
            This needs an internet connection and might take a few minutes.
          </p>
          <p>
            <button onclick={handleInstall}>Install</button>
          </p>
        </Match>
        <Match when={phase() == "installing"}>
          <p>
            <strong>{progress().step}</strong> - {formatElapsed(elapsed())}
          </p>
          <progress class="fill" max="100" value={progress().percent} />
          <p>{progress().message}</p>
          <details>
            <summary>Details</summary>
            <pre>{log().join("\n")}</pre>
          </details>
        </Match>
        <Match when={phase() == "installed"}>
          <Show when={props.isFirstInstall} fallback={
            <p>
              Nodeblocks is already installed.
            </p>
          }>
            <p>
              Nodeblocks was installed successfully.
            </p>
          </Show>
        </Match>
        <Match when={phase() == "checking"}>
          <p>Checking installation...</p>
        </Match>
        <Match when={phase() == "error"}>
          <p style={{ color: "crimson" }}>The installation failed.</p>
          <pre>
            {error()}
          </pre>
          <Show when={!error().includes("already running")}>
            <button onclick={handleInstall}>Try again</button>
          </Show>
        </Match>
      </Switch>
    </div>
  );
}
