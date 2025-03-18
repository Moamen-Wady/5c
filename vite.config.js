import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";
import helmet from "helmet";

export default defineConfig({
  plugins: [react(), compression()],
  server: {
    middlewareMode: "html",
    configureServer: (server) => {
      server.middlewares.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
              styleSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://fonts.googleapis.com",
                "'unsafe-inline'",
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
              imgSrc: ["'self'", "data:"],
              connectSrc: ["'self'", "https://5c-back.vercel.app"],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          },
          crossOriginOpenerPolicy: { policy: "same-origin" },
        })
      );
    },
  },
});
