import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "") as {
		ENDPOINT: string;
		MODULE: string;
	};

	return {
		root: "src",
		base: "./",
		envDir: "../",
		envPrefix: "CLIENT_",
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src"),
			},
		},
		define: {
			"import.meta.env.ENDPOINT": JSON.stringify(env.ENDPOINT),
			"import.meta.env.MODULE": JSON.stringify(env.MODULE),
		},
		server: {
			proxy: {
				[env.MODULE]: {
					target: env.ENDPOINT,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		build: {
			outDir: "../../portals",
			emptyOutDir: true,
		},
		plugins: [react()],
	};
});
