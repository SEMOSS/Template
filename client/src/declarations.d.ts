// Type declarations for environment variables and static assets.
// TypeScript uses these to provide autocomplete and type safety.

// Environment variables available via import.meta.env (configured in .env and .env.local)
interface ImportMetaEnv {
	readonly ENDPOINT: string; // SEMOSS server URL (e.g. http://localhost:9090)
	readonly MODULE: string; // API module path (e.g. /Monolith)
	readonly APP: string; // App/project ID
	readonly VITE_ACCESS_KEY: string; // Local dev auth (not used in production)
	readonly VITE_SECRET_KEY: string; // Local dev auth (not used in production)
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Allow importing image files as modules
declare module "*.jpg" {
	const value: string;
	export = value;
}

declare module "*.png" {
	const value: string;
	export = value;
}

declare module "*.svg" {
	const content: string;
	export default content;
}
