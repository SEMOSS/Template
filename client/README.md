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



## Essential commands 

1. **pnpm i** 

    1. Run "pnpm i" in the `client` folder to install dependencies for front-end React application.
    2. Run "pnpm i" in the project root (`assets` folder) to set up the braoder project dependencies (access to Biome, etc).

2. **pnpm build:** 

    1. Run "pnpm build" in `assets` in order to prepare the directory for deployment. 

pnpm build within SEMOSS packages the front-end assets (and potentially other project resources) and outputs them into the `portals` subfolder within `assets`. The `portals` folder is what is reflected on your localhost SEMOSS app. 

To see your changes reflected on the app, save your code and run `pnpm build` in `assets`. Head to your apps page on SEMOSS (http://localhost:9090/SemossWeb/packages/client/dist/#/) and click the Publish Files, Refresh Files, and then the Refresh buttons.

3. **pnpm dev:** 

    1. Run "pnpm dev" in `assets` in order to set up a local vite instance.

pnpm dev starts a local development server with hot-reloading, so any changes you make are instantly reflected in the SEMOSS app. When you save your files, the app updates automatically so you don't need to rebuild every time.


## Support

For questions or issues, contact the SEMOSS team or refer to internal documentation.






