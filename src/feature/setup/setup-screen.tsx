import { createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useI18n } from "~/i18n/i18n-context";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { releaseController } from "~/network/api/github/github-release-controller";

type Phase = "checking" | "idle" | "installing" | "installed" |  "error";

type Progress = { step: string; percent: number; message: string };

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec.toString().padStart(2, "0")}`;
}

export const LocalServerSetupContent = (props: { 
  onReady: () => void, 
}) => {
  const {t} = useI18n();
  const [phase, setPhase] = createSignal<Phase>("checking");
  const [log, setLog] = createSignal<string[]>([]);
  const [error, setError] = createSignal("");
  const [elapsed, setElapsed] = createSignal(0);
  
  const [progress, setProgress] = createSignal<Progress>({ step: "", percent: 0, message: "" });
  const [wheelUrl, setWheelUrl] = createSignal<string | null>(releaseController.serverReleases.at(0)?.server_wheel_url ?? null);

  let timer: NodeJS.Timeout | undefined;

  const handleInstall = async () => {
    const url = wheelUrl();
    if (url == null || url == "") return;

    setPhase("installing");
    setError("");
    setLog([]);
    setElapsed(0);
    timer = setInterval(() => setElapsed((s) => s + 1), 1000);
 
    try {
      await invoke("ensure_environment", {wheelUrl: url});
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
      <h3>{t("pages.settings.setupWizard.install.title")}</h3>
      <Switch>
        <Match when={phase() == "idle"}>
          <p>
            {t("pages.settings.setupWizard.install.setupInfo")} (Python, <a href="https://github.com/yDewolf/nodeblocks-server">Nodeblocks Server</a>).
            {t("pages.settings.setupWizard.install.setupInfo1")}
          </p>
          <div class="field-grid">
            <label for="setup-serverRelease" class="field-label">{t("words.serverRelease")}</label>
            <div class="field-input row-container">
              <select id="setup-serverRelease" class="field-input"
                value={wheelUrl}
                oninput={(e) => setWheelUrl(e.target.value)}                
              >
                <For each={releaseController.serverReleases}>
                  {(release) => 
                    <option value={release.server_wheel_url}>
                      {release.server_version}
                    </option>
                  }
                </For>
              </select>
              <button class="icon-button" onclick={() => releaseController.fetchServerReleases()}>
                <RefreshIcon class="smaller-icon"/>
              </button>
            </div>
          </div>
          <p>
            <button class="text-button" 
              onclick={handleInstall}
              disabled={wheelUrl() == null || wheelUrl() == ""}
            >{t("pages.settings.setupWizard.install.install")}</button>
          </p>
        </Match>
        <Match when={phase() == "installing" || phase() == "installed"}>
          <Show when={phase() == "installing"} fallback={
            <p>
              {t("pages.settings.setupWizard.install.messages.installedSuccessfully")}
            </p>
          }>
            <p>
              <strong>{progress().step}</strong> - {formatElapsed(elapsed())}
            </p>
            <progress class="fill" max="100" value={progress().percent} />
            <p>{progress().message}</p>
          </Show>
          <details>
            <summary>{t("words.details")}</summary>
            <pre>{log().join("\n")}</pre>
          </details>
        </Match>
        <Match when={phase() == "checking"}>
          <p>{t("pages.settings.setupWizard.install.messages.checkingInstallation")}</p>
        </Match>
        <Match when={phase() == "error"}>
          <p style={{ color: "crimson" }}>{t("pages.settings.setupWizard.install.messages.installFailed")}</p>
          <pre>
            {error()}
          </pre>
          <Show when={!error().includes("already running")}>
            <button class="text-button" onclick={handleInstall}>{t("actions.tryAgain")}</button>
          </Show>
        </Match>
      </Switch>
    </div>
  );
}
