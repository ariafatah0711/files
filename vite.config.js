import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const pwaConfig = {
  registerType: "autoUpdate",
  manifest: {
    name: "files",
    short_name: "files",
    description: "files web online",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/files/icon.svg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/files/icon.svg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  workbox: {
    runtimeCaching: [
      // Caching untuk file statis seperti HTML, CSS, JS, gambar, dan font
      {
        urlPattern: /\.(html|css|js|jpg|jpeg|png|svg|gif|woff|woff2|eot|ttf|otf)$/i, // Pola untuk file statis
        handler: "CacheFirst", // Menggunakan cache terlebih dahulu untuk performa lebih cepat
        options: {
          cacheName: "static-assets-cache", // Nama cache untuk file statis
          expiration: {
            maxEntries: 100, // Maksimum menyimpan 100 file
            maxAgeSeconds: 604800, // Cache kedaluwarsa setelah 1 minggu (7 hari)
          },
        },
      },
      // Caching untuk API GitHub (Daftar repository user)
      {
        urlPattern: /^https:\/\/api\.github\.com\/user\/repos.*/i, // Pola URL untuk daftar repositori user
        handler: "NetworkFirst", // Prioritaskan jaringan, gunakan cache jika offline
        options: {
          cacheName: "github-user-repos-cache", // Nama cache untuk API repositori user
          expiration: {
            maxEntries: 20, // Maksimum menyimpan 20 request API
            maxAgeSeconds: 1800, // Cache API GitHub kedaluwarsa setelah 30 menit
          },
          networkTimeoutSeconds: 3, // Timeout jaringan 3 detik sebelum mengambil dari cache
        },
      },
    ],
  },
};

export default defineConfig({
  plugins: [vue(), tailwindcss(), VitePWA(pwaConfig)],
  base: "/",
});
