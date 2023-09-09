import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "process";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: Number(env.VITE_SERVER_PORT ?? 5173),
		proxy: {
			"/api": `http://${env.SERVER_HOST ?? "localhost"}:${env.SERVER_PORT ?? 3210}`,
		},
	},
});
