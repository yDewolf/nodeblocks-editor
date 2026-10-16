import { createContext, useContext, ParentComponent } from "solid-js";
import { NotificationController } from "../controllers/notification-controller";

const NotificationContext = createContext<NotificationController>();

export const NotificationProvider: ParentComponent<{ controller: NotificationController }> = (props) => {
    return (
        <NotificationContext.Provider value={props.controller}>
            {props.children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications muts be used inside a <NotificationProvider>");
    }
  
    return context;
};
