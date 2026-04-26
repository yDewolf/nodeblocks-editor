import { sessionStorage } from "./session-store";
import { NodeServerClient } from "../websocket/websocket-handler";
import { UserSession } from "./user-session";
import { UserWorkspace } from "./user-workspace";

export class SessionController {
    client: NodeServerClient;

    user_session: UserSession;
    user_workspace: UserWorkspace;

    constructor(host: string = "localhost", port: number = 3001) {
        this.user_session = new UserSession(sessionStorage.username);
        this.client = new NodeServerClient(this.user_session, host, port);

        this.user_workspace = new UserWorkspace(this.client);
    }
}