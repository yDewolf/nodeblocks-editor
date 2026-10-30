import { createSignal, onMount, Show } from "solid-js";
import { usePackageManager } from "../editor/contexts/package-manager-context";
import { useAppSession } from "~/network/app-session-provider";
import { MetadataController } from "../metadata/metadata_controller";
import { DocsController } from "./docs-controller";
import { MetadataProvider } from "../metadata/metadata-context";
import { DocsProvider, DocsUrlSync } from "./docs-context";
import { DocsView } from "./docs-view";
import { PackageManagerHTTPController } from "~/network/api/package-http-controller";

export default function DocsRoute() {
    const appSession = useAppSession();
    const packageManager = usePackageManager();
    const packageController = new PackageManagerHTTPController(appSession);
    packageController.fetchAndLoadManifests(packageManager);
    
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    const metadataController = new MetadataController(appSession, packageManager);
    const docsController = new DocsController(metadataController);
    
    return (
            <Show 
                when={appSession.isAuthenticated() && isMounted()} 
                fallback={
                    <div>
                    </div>
                }
            >
                <MetadataProvider controller={metadataController}>
                    <DocsProvider controller={docsController}>
                        <DocsUrlSync />
                        <DocsView />
                    </DocsProvider>
                </MetadataProvider>
            </Show>
        )
}