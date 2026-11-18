import { RemoteServerConfigForm } from "../components/remote-server-connect-form";
import { useSetup } from "../setup-wizard-context";

export const RemoteServerConnection = () => {
    const wizard = useSetup();
    return (
        <>
            <RemoteServerConfigForm/>
        </>
    );
}