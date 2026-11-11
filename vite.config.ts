import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import solidSvg from 'vite-plugin-solid-svg';

export default defineConfig({
    plugins: [solidStart(), nitro(), solidSvg()],
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