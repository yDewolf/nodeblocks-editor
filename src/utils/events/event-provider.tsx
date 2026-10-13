import { createContext, ParentComponent, useContext } from "solid-js";
import { EventManager } from "./event-manager";

const EventManagerContext = createContext<EventManager>();

export const useEventManager = () => {
    const manager = useContext(EventManagerContext);
    return manager;
};

export const EventManagerProvider: ParentComponent<{ manager: EventManager }> = (props) => {
    return (
        <EventManagerContext.Provider value={props.manager}>
            {props.children}
        </EventManagerContext.Provider>
    );
};