import { makePersisted } from "@solid-primitives/storage";
import { createStore, SetStoreFunction } from "solid-js/store";

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
    server_version: string;
    server_wheel_url: string;
}

const RELEASE_CACHE_KEY = "app-releases-cache";
const SERVER_REPO = "yDewolf/nodeblocks-server";

interface ReleaseStore {
    serverReleases: ServerRelease[]
}

export class GithubReleaseController {
    private _releaseStore: ReleaseStore;
    private _setReleaseStore: SetStoreFunction<ReleaseStore>;

    constructor(

    ) {
        [this._releaseStore, this._setReleaseStore] = makePersisted(createStore<ReleaseStore>({
            serverReleases: []
        }), {name: RELEASE_CACHE_KEY});

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
                    const serverVersion = match ? match[1] : release.tag_name;

                    validReleases.push({
                        ...release,
                        server_version: serverVersion,
                        server_wheel_url: wheelAsset.browser_download_url,
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
