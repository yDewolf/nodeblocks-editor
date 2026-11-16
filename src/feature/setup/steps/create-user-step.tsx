import { useSetup } from "../setup-wizard-context";
import { LoginForm } from '../../home/components/login-form';

export const CreateUserStep = () => {
    const wizard = useSetup();
    
    return (
        <>
            <p>To use the editor, you must create a user.</p>
            <p class="note">All scenes you create are linked to your user. Only you, and allowed users, can see them.</p>
            <p class="note">Your session will remain after closing the app.</p>
            <br />
            <LoginForm />
        </>
    );
}