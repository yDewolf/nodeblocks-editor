import { makePersisted } from "@solid-primitives/storage";
import { createStore, SetStoreFunction } from "solid-js/store";
import { SERVER_API_VERSION } from "../api-version";

export interface GithubAsset {
    name: string;
    browser_download_url: string;
}

export interface GithubRelease {
    id: number;
    tag_name: string;
    prerelease: boolean;
    published_at: string;
    assets?: GithubAsset[];
}

export interface ServerRelease extends GithubRelease {
    raw_version: string;
    engine_version: string;
    server_version: string;
    server_wheel_url: string;
    mightNotBeCompatible: boolean;
}

const RELEASE_CACHE_KEY = "app-releases-cache";
const SERVER_REPO = "yDewolf/nodeblocks-server";

interface ReleaseStore {
    serverReleases: ServerRelease[]
}

function compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('-')[0].split('.').map(Number);
    const p2 = v2.split('-')[0].split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

export class GithubReleaseController {
    private _releaseStore: ReleaseStore;
    private _setReleaseStore: SetStoreFunction<ReleaseStore>;

    constructor() {
        [this._releaseStore, this._setReleaseStore] = makePersisted(createStore<ReleaseStore>({
            serverReleases: []
        }), { name: RELEASE_CACHE_KEY });

        if (this._releaseStore.serverReleases.length == 0) {
            this.fetchServerReleases();
        }
    }

    get serverReleases(): ServerRelease[] {
        return this._releaseStore.serverReleases;
    }

    public async fetchServerReleases(): Promise<GithubRelease[]> {
        try {
            const response = await fetch(`https://api.github.com/repos/${SERVER_REPO}/releases`, {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch releases from github");
            }

            const data: GithubRelease[] = await response.json();
            const validReleases: ServerRelease[] = [];

            for (const release of data) {
                if (!release.assets || release.assets.length === 0) continue;
                const wheelAsset = release.assets.find(asset => 
                    /^nodeblocks-(.+)-py3-none-any\.whl$/.test(asset.name)
                );

                if (wheelAsset) {
                    const match = wheelAsset.name.match(/^nodeblocks-(.+)-py3-none-any\.whl$/);
                    const rawVersion = match ? match[1] : release.tag_name;

                    let engineVersion = rawVersion;
                    let serverVersion = "0.0.0";

                    if (rawVersion.includes("+server.")) {
                        const parts = rawVersion.split("+server.");
                        engineVersion = parts[0];
                        serverVersion = parts[1];
                    } else if (rawVersion.includes("+")) {
                        engineVersion = rawVersion.split("+")[0];
                    }

                    const mightNotBeCompatible = compareVersions(serverVersion, SERVER_API_VERSION) < 0;
                    validReleases.push({
                        ...release,
                        raw_version: rawVersion,
                        engine_version: engineVersion,
                        server_version: serverVersion,
                        server_wheel_url: wheelAsset.browser_download_url,
                        mightNotBeCompatible,
                    });
                }
            }

            this._setReleaseStore("serverReleases", validReleases);
            return validReleases;
        
        } catch (error) {
            console.error("Failed to load server releases:", error);
            return this._releaseStore.serverReleases;
        }
    }
}

export const releaseController = new GithubReleaseController();