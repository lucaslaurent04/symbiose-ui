export interface Component {
	label?: string;
	properties: Record<string, any>;
}

export interface ComponentPropertiesDocumentation {
	name: string;
	type: string;
	description: string | (() => string);
}

export interface Documentation {
	[key: string | 'inputs' | 'outputs']: ComponentPropertiesDocumentation[];
}

export interface Showcase {
	componentSelector: any;
	columns: number;
	title?: string;
	description?: string;
	components: Component[];
	documentation: Documentation;
}
