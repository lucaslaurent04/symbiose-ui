const fs = require('fs');
const path = require('path');

// Path to the directory containing files you want to import
const directoryPath = path.resolve(__dirname, '../src/app/component-doc');
const outputFile = path.resolve(__dirname, 'showcases.ts');

// Get all JSON files in the directory
const jsonFiles = fs.readdirSync(directoryPath)
	.filter((file: string) => file.endsWith('.json'))
	.map((file: string) => path.basename(file, '.json'));

// Arrays to store import statements and showcases initialization
const componentImports: string[] = [];
const showcases: any[] = [];

// Generate import statements and showcases array
jsonFiles.forEach((file: any) => {
	const showcase = require(path.resolve(directoryPath, `${file}.json`));
	const componentSelector = showcase.componentSelector.replace(/'/g, ''); // Remove single quotes
	componentImports.push(`import { ${componentSelector} } from 'sb-shared-lib';`);
	showcases.push({
		...showcase,
		componentSelector
	});
});

// Create the content to be written to showcases.ts
const content = `
import { Showcase } from './app/_types/showcaseType';
${componentImports.join('\n')}

export const showcases: Showcase[] = [
${showcases.map(showcase => `
  {
    title: ${JSON.stringify(showcase.title)},
    columns: ${showcase.columns},
    componentSelector: ${showcase.componentSelector},
    components: ${JSON.stringify(showcase.components, null, 2)},
    documentation: ${JSON.stringify(showcase.documentation, null, 2)}
  }`).join(',\n')}
];
`;

// Write the content to showcases.ts
fs.writeFileSync(outputFile, content);
console.log('File list generated:', jsonFiles);
