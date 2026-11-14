import "@bcr32/panel/themes/tokens.css";
import "@bcr32/panel/themes/device.css";
import "@bcr32/panel/themes/flat.css";
import "@bcr32/panel/panel.css";
import "./app.css";

import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
