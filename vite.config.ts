import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import glsl from 'vite-plugin-glsl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), glsl()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
