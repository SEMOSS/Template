// Entry point: mounts the React app into the DOM.
// Flow: index.html -> index.tsx -> App.tsx -> Router -> Pages
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
