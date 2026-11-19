import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// For a user/org page (stcksmsh.github.io) base stays "/".
// For a project page it'd be "/repo-name".
export default defineConfig({
  // Served at the custom domain set in the repo's Pages settings; stcksmsh.github.io 301s there.
  site: "https://kostavukicevic.com",
  base: "/",
  integrations: [react(), mdx()],
  output: "static",
});
