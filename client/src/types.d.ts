export interface MCPTool {
	name: string;
	description?: string;
	inputSchema?: {
		type: "object";
		title: string;
		properties?: {
			[key: string]: {
				type: string;
				description?: string;
				enum?: string[];
				items?: unknown;
				minimum?: number;
				maximum?: number;
				minLength?: number;
				maxLength?: number;
				pattern?: string;
				format?: string;
				default?: unknown;
			};
		};
		required?: string[];
		additionalProperties?: boolean;
	};
}

export interface Tool extends MCPTool {
	name: string;
	description: string;
	_meta: { generated_on: string };
	title: string;
}

export interface ToolStructure {
	_meta: {
		SMSS_PROJECT_NAME: string;
		SMSS_PROJECT_ID: string;
		SMSS_ENGINE_NAME: string;
		SMSS_ENGINE_TYPE: string;
		SMSS_ENGINE_ID: string;
	};
	tools: Tool[];
}

export interface ToolResponse {
	id: string;
	message: string;
	name: string;
	type: string;
	parameters: Record<string, unknown>;
}
