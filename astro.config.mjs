import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// For a user/org page (kostavukicevic.github.io) base stays "/".
// For a project page it'd be "/repo-name".
export default defineConfig({
  site: "https://kostavukicevic.github.io",
  base: "/",
  integrations: [react(), mdx()],
  output: "static",
});
