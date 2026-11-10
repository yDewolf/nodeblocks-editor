import { useAppSession } from "~/server/session"
import { UserSessionData } from "./user-session"

export interface UserSessionData {
    user_id: string
    display_name: string
}export async function getUserSession(): Promise<UserSessionData | null> {
    const session = await useAppSession();
    return (session.data as UserSessionData) || null;
}
 