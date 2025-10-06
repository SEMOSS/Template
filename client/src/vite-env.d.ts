interface ImportMetaEnv {
	readonly ENDPOINT: string;
	readonly MODULE: string;
	readonly CLIENT_ACCESS_KEY: string;
	readonly CLIENT_SECRET_KEY: string;
	readonly CLIENT_APP: string;
	// more env variables...
}

// biome-ignore lint/correctness/noUnusedVariables: Vite environment variable
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
