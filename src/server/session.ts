import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { UserSessionData } from "~/network/protocols/user-session";

interface AppSession {
    userSession?: UserSessionData,
    serverUrl?: string
}

const [appSession, _setAppSession] = makePersisted(
    createStore<AppSession>({
        serverUrl: "http://localhost:8080"
    }), 
    {name: "app-session"}
);

export const getUserSession = () => {
    return appSession.userSession
}
export {appSession, _setAppSession};
