// Vite build configuration for the SEMOSS app.
//
// Key details:
//   - Source root is client/src/ (where index.html lives)
//   - "@/" path alias maps to client/src/ for clean imports
//   - Dev server proxies API calls to the SEMOSS backend (ENDPOINT from .env)
//   - Production build outputs to portals/ (which SEMOSS serves as the published app)
//   - Environment variables (ENDPOINT, MODULE, APP) come from .env and .env.local

import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "") as {
		ENDPOINT: string;
		MODULE: string;
		APP: string;
	};

	return {
		root: "src",
		base: "./",
		envDir: "../",
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src"),
			},
		},
		define: {
			"import.meta.env.ENDPOINT": JSON.stringify(env.ENDPOINT),
			"import.meta.env.MODULE": JSON.stringify(env.MODULE),
			"import.meta.env.APP": JSON.stringify(env.APP),
		},
		server: {
			// Proxies /Monolith requests to the SEMOSS backend during local dev
			proxy: {
				[env.MODULE]: {
					target: env.ENDPOINT,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		build: {
			// Build output goes to portals/, which SEMOSS serves when the app is published
			outDir: "../../portals",
			emptyOutDir: true,
		},
		plugins: [react(), tailwindcss()],
	};
});
