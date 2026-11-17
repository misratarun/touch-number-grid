import { VitePWA } from "vite-plugin-pwa";

// Built as an app that installs to the home screen and then runs with no
// connection: every file is saved on the device the first time it opens.
export default {
  base: "./", // works from any address, including a sub-folder
  plugins: [
    VitePWA({
      registerType: "autoUpdate", // a newer version replaces the saved one next time it opens online
      includeAssets: ["icons/*.png"],
      workbox: { globPatterns: ["**/*.{js,css,html,png,svg,json}"] },
      manifest: {
        name: "Numbers",
        short_name: "Numbers",
        description: "A calm number board: touch a number to hear it.",
        display: "fullscreen",
        orientation: "any",
        background_color: "#ecebe6",
        theme_color: "#ecebe6",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
};
