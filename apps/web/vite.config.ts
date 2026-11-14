// Static build (D54): no server code, no network at run time. The browser bundle imports the schema
// file of device-data only: its loader reads files and belongs to Node.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@bcr32/device-data": new URL("../../packages/device-data/src/schema.ts", import.meta.url).pathname },
  },
  server: { fs: { allow: ["../.."] } },
  build: { outDir: "dist", emptyOutDir: true, target: "es2022" },
});
