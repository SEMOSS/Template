# Client Folder README

This folder contains the front-end React application for your SEMOSS app.

---

## Local development

Before running or building the app, you need to create a `.env.local` file in this folder. This file stores environment-specific variables, impora SEMOSS app ID.

1. In the `client` folder, create a new file called `.env.local`.
2. Add the following line (replace `your-app-id` with your actual SEMOSS app ID): `CLIENT_APP="your-app-id"`

After setting up your `.env.local file`, you’ll need to add a `project.properties` file for the Java backend. This serves as a foundational configuration file that is required for project structure and build tools.

1. In the `java` folder (in the `client` directory), create a new file named `project.properties`.
2. Leave this blank ofr now, no configuration is currently needed, however the file must exist to ensure the backend can initialize.

## Create an MCP tool UI
1. Create a new component in the [pages](src/pages) or [mcp](src/components/mcp/) folder using the [mcp template](src/components/mcp/_templates/ToolPageTemplate.tsx)
2. Update [routes.constants.tsx](src/pages/routes.constants.tsx) to include a mapping of tool name to the new component
3. If no mapping is defined for a tool, a default UI will be displayed
4. For setting up an MCP tool on the backend, see [Create an MCP tool](../README.md#create-an-mcp-tool) in the main README 



### Quick Start: Adding a New Tool Page

1. **Copy the template:**
   ```bash
   cp client/src/pages/_templates/ToolPageTemplate.tsx client/src/pages/MyToolName.tsx
   ```

2. **Customize your page:**
   - Update the component name from `ToolPageTemplate` to `MyToolName`
   - Replace the form fields with your tool's specific parameters
   - Update the title and any other text

3. **Register the route:**
   Add your page to [client/src/pages/routes.constants.tsx](client/src/pages/routes.constant.tsx):
   ```tsx
   export const PAGE_TYPES = {
     get_stock_price: <GetStockPrice />,
     get_stock_history: <GetStockHistory />,
     my_tool_name: <MyToolName />, // Add this line
   } as const;

  

## Essential commands

1. **pnpm i** - Install Dependencies

   1. Run "pnpm i" in the `client` folder to install all necessary packages for the front-end React application.
   2. Run "pnpm i" in the project root (`assets` folder) to set up the broader project dependencies, including tools like Biome.

2. **pnpm build:**

   1. Run "pnpm build" in the `assets` folder to compile and bundle your front-end code and related resources for production.
   2. Build output is placed into the `portals` folder within `assets`. The `portals` directory is what SEMOSS displays as your local app.

> **Note:**  
> After saving changes to your code, run **pnpm build** in the `assets`
> folder to update the build. To see updates in your SEMOSS app (http://
> localhost:9090/SemossWeb/packages/client/dist/#/), use the Publish
> Files, Refresh Files, and then Refresh buttons to ensure your changes
> appear.

3. **pnpm dev:**

   1. Run "pnpm dev" in the `assets` folder to launch a local development server for your app.
   2. This command starts a local Vite server, which serves your project on your machine and provides hot reloading.
   3. When you save changes to your files, Vite immediately updates the app in your browser so you can see your latest changes without running pnpm build and manually refreshing.
4. **pnpm dlx shadcn@latest add [component-name]**\
   
   1. To add a new shadcn componet to use with your front end, from the `client` folder run pnpm dlx shadcn-ui@latest add [component-name]


## Resources 

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)


## Support

For questions or issues, contact the SEMOSS team or refer to internal documentation.
