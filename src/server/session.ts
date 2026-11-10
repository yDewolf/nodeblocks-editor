"use server";
import { useSession } from "@solidjs/start/http";

export async function useAppSession() {
    if (!process.env.SESSION_SECRET) {
        console.error("Missing .env SESSION_SECRET");
    }
    return useSession({
        name: "nodeblocks-app-session",
        password: process.env.SESSION_SECRET,
    });
}
