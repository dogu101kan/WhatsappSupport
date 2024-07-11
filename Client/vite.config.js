/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                rewrite: (path) => path.replace(/^\/api/, ""),
                changeOrigin: true,
                ws: true,
            },
        },
    },
    define: {
        apiURL: JSON.stringify("http://localhost:5000/api"),
        apiURL_SOCKET: JSON.stringify("http://localhost:5000"),
    },
    plugins: [react()],
});
