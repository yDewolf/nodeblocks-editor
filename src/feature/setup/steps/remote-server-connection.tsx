import { RemoteServerConfigForm } from "~/feature/remote-server/remote-server-config";
import { useSetup } from "../setup-wizard-context";

export const RemoteServerConnection = () => {
    const wizard = useSetup();
    return (
        <>
            <RemoteServerConfigForm/>
        </>
    );
}