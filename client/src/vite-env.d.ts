interface ImportMetaEnv {
	readonly ENDPOINT: string;
	readonly MODULE: string;
	readonly CLIENT_ACCESS_KEY: string;
	readonly CLIENT_SECRET_KEY: string;
	readonly CLIENT_APP: string;
	// more env variables...
}

export interface ImportMeta {
	readonly env: ImportMetaEnv;
}
