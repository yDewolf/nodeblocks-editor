import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { createSignal, onMount, onCleanup, Switch, Match, For, Show, createMemo, createEffect } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";
import { releaseController } from "~/network/api/github/github-release-controller";
import { useSetup } from "../setup-wizard-context";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { localServerController } from "~/network/api/local-server-controller";
import { SERVER_API_VERSION } from "~/network/api/api-version";


export const LocalServerInstall = () => {
    const wizard = useSetup();
    const {t} = useI18n();
    const [wheelUrl, setWheelUrl] = createSignal<string | null>(releaseController.serverReleases.at(0)?.server_wheel_url ?? null);

    return (
        <>
            <Show when={localServerController.isInstalled}>
                <p>{t("pages.setupWizard.install.messages.alreadyInstalled")} {t("pages.setupWizard.install.installedVersion")}: <b>{localServerController.installedVersion}</b></p>
                <p>{t("pages.setupWizard.install.messages.installAnotherVersion")}</p>
            </Show>
            <div class="text-section">
                <br />
                <ServerReleaseSelector wheel={wheelUrl()} setWheel={setWheelUrl}/>
                <Show when={wheelUrl()}>
                    {(url) => <>
                        <br />
                        <LocalServerInstaller wheelUrl={url()} onInstallFinish={() => {

                        }}/>
                    </>}
                </Show>
            </div>
        </>
    );
}


export const ServerReleaseSelector = (props: {
    wheel: string | null,
    setWheel: (wheel: string) => void,
}) => {
    const {t} = useI18n();
    return (
        <>
            <div class="field-grid">
                <label for="setup-serverRelease" class="field-label">{t("words.serverRelease")}</label>
                <div class="field-input row-container">
                    <select id="setup-serverRelease" class="field-input"
                        value={props.wheel ?? undefined}
                        oninput={(e) => props.setWheel(e.target.value)}                
                    >
                        <For each={releaseController.serverReleases}>
                        {(release) => 
                            <option value={release.server_wheel_url}>
                            <Show when={release.mightNotBeCompatible}>
                                ⚠️
                            </Show>
                            {release.raw_version} {release.prerelease ? `(${t("words.preRelease")})` : ""}
                            </option>
                        }
                        </For>
                    </select>
                    <button class="icon-button" onclick={() => releaseController.fetchServerReleases()}>
                        <RefreshIcon class="smaller-icon"/>
                    </button>
                </div>
            </div>
            <p class="note">{t("pages.setupWizard.install.releaseSourceNote")} <a href="https://github.com/yDewolf/nodeblocks-server/releases">Github Releases</a></p>
            <p class="note">{t("pages.setupWizard.install.incompatibleReleasesNote")}</p>
            <p class="note">{t("pages.setupWizard.install.clientWasBuiltForVersion")}: <b>{SERVER_API_VERSION}</b></p>
        </>
    )
}

type InstallationPhase = "idle" | "installing" | "installed" | "error";
export const LocalServerInstaller = (props: {
    wheelUrl: string,
    onInstallFinish?: () => void
}) => {
    const {t} = useI18n();
    const release = createMemo(() => releaseController.serverReleases.find((release) => release.server_wheel_url == props.wheelUrl));
    
    return (
        <>
            <Show when={release()}>
                {(releaseData) => <>
                    <div class="row-container fill">
                        <p>{t("words.state")}: {releaseData().prerelease ? t("words.preRelease") : t("words.release")}</p>
                        |
                        <p>{t("words.serverVersion")}: {releaseData().server_version}</p>
                        |
                        <p>{t("words.engineVersion")}: {releaseData().engine_version}</p>
                    </div>
                    <InstallerContent
                        wheelUrl={props.wheelUrl} 
                        onError={(message) => {

                        }}
                    />
                    <br />
                    <Show when={localServerController.isInstalled}>
                        <p>{t("pages.setupWizard.install.messages.serverVersionIsInstalled", localServerController.installedVersion ?? t("words.unknown"))} <b>{t("pages.setupWizard.messages.youCanProceed")}</b></p>
                    </Show>
                </>}
            </Show>
        </>
    )
}

type Progress = { step: string; percent: number; message: string; };
export const InstallerContent = (props: {
    wheelUrl: string,
    onFinished?: () => void,
    onError: (message: string) => void,
}) => {
    const {t} = useI18n();

    const [phase, setPhase] = createSignal<InstallationPhase>("idle");
    const [progress, setProgress] = createSignal<Progress>({ step: "", percent: 0, message: "" });

    const [error, setError] = createSignal("");
    const [log, setLog] = createSignal<string[]>([]);
    const [elapsed, setElapsed] = createSignal(0);
    let installedWheel: string | undefined = undefined;

    let timer: NodeJS.Timeout | undefined;

    const handleInstall = async () => {
        if (props.wheelUrl == null || props.wheelUrl == "") return;
        setPhase("installing");
        timer = setInterval(() => setElapsed((s) => s + 1), 1000);
     
        try {
            localServerController.installEnvironment(props.wheelUrl);
            installedWheel = props.wheelUrl;
            props.onFinished?.();
        } catch (e) {
            const error = String(e);
            setError(error);
            setPhase("error");            
            props.onError(error);
        } finally {
            clearInterval(timer);
        }
    };
    
    let unlisten: UnlistenFn | undefined;
    createEffect(() => {
        if (props.wheelUrl != installedWheel && installedWheel != undefined) {
            setPhase("idle");
            setLog([]);
            setError("");
            setElapsed(0);
        }
    });
    onMount(async () => {
        unlisten = await listen<Progress>("env-setup-progress", (event) => {
            setProgress(event.payload);
            setLog((lines) => [...lines.slice(-199), event.payload.message]);
        });
    });

    onCleanup(() => {
        unlisten?.();
    });
    
    return (
        <>
            <Switch>
                <Match when={phase() == "installing"}>
                    <p>
                    <strong>{progress().step}</strong> - {formatElapsed(elapsed())}
                    </p>
                    <progress class="fill" max="100" value={progress().percent} />
                    <p>{progress().message}</p>
                </Match>
                <Match when={phase() == "error"}>
                    <p style={{ color: "crimson" }}>{t("pages.setupWizard.install.messages.installFailed")}</p>
                    <pre>
                        {error()}
                    </pre>
                </Match>
                <Match when={phase() == "installed"}>
                    <p>{t("pages.setupWizard.install.messages.installedSuccessfully")}</p>
                </Match>
            </Switch>
            <Show when={phase() != "installing"}>
                <button onclick={handleInstall} class="text-button">
                    {t("pages.setupWizard.install.install")}
                </button>
            </Show>
            <Show when={phase() == "installing" || phase() == "installed"}>
                <details class="fill">
                    <summary>{t("words.details")}</summary>
                    <pre class="fill">{log().join("\n")}</pre>
                </details>
            </Show>
        </>
    )
}

function formatElapsed(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes}:${sec.toString().padStart(2, "0")}`;
}