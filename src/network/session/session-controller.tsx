import { sessionStorage } from "./session-store";
import { NodeServerClient } from "../websocket/websocket-handler";
import { UserSession } from "./user-session";
import { UserWorkspace } from "./user-workspace";
import { NotificationController } from "../controllers/notification_controller";

export class SessionController {
    client: NodeServerClient;

    user_session: UserSession;
    user_workspace: UserWorkspace;

    notification_controller: NotificationController

    constructor(host: string = "localhost", port: number = 3001) {
        this.user_session = new UserSession(sessionStorage.username);
        this.client = new NodeServerClient(this.user_session, host, port);

        this.user_workspace = new UserWorkspace(this.client);
        this.notification_controller = new NotificationController(this.client);
    }
}