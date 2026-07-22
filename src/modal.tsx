import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SheetEditorApp from "./pages/SheetEditorApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SheetEditorApp />
  </StrictMode>,
);
