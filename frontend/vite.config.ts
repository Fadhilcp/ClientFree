import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   port: 5173, // your local port
  //   strictPort: true,
  //   host: true, // allow network access
  //   allowedHosts: [
  //     "localhost",
  //     "127.0.0.1",
  //     "turned-helen-encyclopedia-idle.trycloudflare.com", // add the Cloudflare tunnel hostname
  //   ],
  // },
});
