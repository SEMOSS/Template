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
