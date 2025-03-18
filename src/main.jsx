import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";

function rel() {
  window.onload = () => {
    const style = document.getElementById("main-css");
    style.rel = "stylesheet";
  };
}
window.onload = rel;

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
