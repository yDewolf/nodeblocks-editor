import { createContext, useContext, ParentComponent } from "solid-js";
import { NotificationController } from "../controllers/notification/notification-controller";

const NotificationContext = createContext<NotificationController>();

export const NotificationProvider: ParentComponent<{ controller: NotificationController }> = (props) => {
    return (
        <NotificationContext.Provider value={props.controller}>
            {props.children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
