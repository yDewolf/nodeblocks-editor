import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import solidSvg from 'vite-plugin-solid-svg';
import { nitro } from "nitro/vite";

export default defineConfig({
    plugins: [solidStart({ ssr: false }), nitro({preset: "static"}), solidSvg()],
    clearScreen: false,
    server: {
        port: 3000,
        strictPort: true,
        watch: {
            ignored: [
                "**/src-tauri/*"
            ]
        }
    },
});