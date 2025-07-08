import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";

const rel = setInterval(() => {
  const style = document.getElementById("main-css") as HTMLLinkElement;
  if (style) {
    style.rel = "stylesheet";
    clearInterval(rel);
  }
}, 50);
window.onload = () => rel;

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element with id "root" not found.');
}
