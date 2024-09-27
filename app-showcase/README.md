# Symbiose UI Showcase

## Overview

Welcome to the Symbiose UI Showcase! This Angular application is designed to dynamically display and showcase various Angular components with customizable options. The app is built to automatically generate showcases based on component documentation files, providing a flexible and interactive way to visualize components.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js ( 14.18 )
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yesbabylon/symbiose-ui
   ```

2. Navigate to the project directory:
   ```bash
   cd app-showcase
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

To start the development server:
```bash
npm start
```
This command runs the `ts-node src/generate-file-list.ts` script to generate the showcases file and then starts the Angular development server.

To build the app:
```bash
npm run build
```

To run tests:
```bash
npm test
```

To lint the code:
```bash
npm run lint
```

To run end-to-end tests:
```bash
npm run e2e
```

## Adding New Components to the Showcase

To add a new component to the showcase, follow these steps:

1. **Create Component Documentation**

   Add a new JSON file to the `src/app/component-doc` directory. The JSON file should adhere to the `Showcase` TypeScript type and include:
	- `title`: The title of the component.
	- `columns`: Number of columns for display.
	- `componentSelector`: The Angular component selector.
	- `description`: A brief description of the component.
	- `components`: An array of component variations, each with:
		- `label`: A label for the showcase variation.
		- `properties`: The properties for the component in this variation.
	- `documentation`: Detailed documentation of the component’s inputs and outputs.

   Example (`eq-string.json`):
   ```json
   {
     "title": "eq-string",
     "columns": 4,
     "componentSelector": "EqStringComponent",
     "description": "The EqStringComponent is an Angular component used for rendering an editable text input field. It supports various customization options, including validation, and emits changes to the parent component.",
     "components": [ ... ],
     "documentation": { ... }
   }
   ```

2. **Update the File List**

   Run the `generate-file-list.ts` script to update the showcases file with the new component information:
   ```bash
   npm run generate-file-list
   ```

   This script reads all JSON files from `src/app/component-doc`, imports the corresponding Angular components, and generates a `showcases.ts` file.

3. **Verify the Showcase**

   After updating the showcases file, start the development server and verify that the new component appears correctly in the showcase.

## Project Structure

- **`src/app/component-doc/`**: Contains JSON files with component documentation and configuration. Ensure all component JSON files are placed in this directory.
- **`src/generate-file-list.ts`**: Script to generate the `showcases.ts` file from component documentation. This file must respect the `Showcase` TypeScript type.
- **`src/app/app.root.component.ts`**: Root component for the Angular app.

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/new-component
   ```
3. Make your changes and commit:
   ```bash
   git commit -am 'Add new component'
   ```
4. Push to your fork:
   ```bash
   git push origin feature/new-component
   ```
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to reach out with any questions or issues. Happy coding!
