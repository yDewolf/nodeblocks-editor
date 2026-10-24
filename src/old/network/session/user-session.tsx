import { nanoid } from "nanoid";
import { setStore, sessionStorage } from "./session-store";
import { createSignal } from "solid-js";

export class UserSession {
    private _session_token: () => string | undefined;
    private _set_session_token: (value: string | undefined) => void;
    private _username: () => string;
    private _set_username: (username: string) => void;

    constructor(username: string = "") {
        const [getSessionToken, setSessionToken] = createSignal(sessionStorage.session == "" ? undefined : sessionStorage.session);
        this._session_token = getSessionToken;
        this._set_session_token = setSessionToken;
        
        const [getUsername, setUsername] = createSignal(username == "" ? nanoid(6) : username);
        this._username = getUsername;
        this._set_username = setUsername;

        setStore("username", this.username);
    }

    get session_token() { return this._session_token(); }
    set session_token(value: string | undefined) { this._set_session_token(value); }
    get username() { return this._username() }
}
