import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // Temporary: `@kagadmodyaa/sketchbook` isn't published yet, so resolve it
      // to the vendored copy in vendor/sketchbook/. Once the npm package is
      // published, delete this alias (and tsconfig's matching `paths`) and
      // remove vendor/sketchbook/.
      {
        find: /^@kagadmodyaa\/sketchbook\/style\.css$/,
        replacement: fileURLToPath(new URL('./vendor/sketchbook/sketchbook.css', import.meta.url)),
      },
      {
        find: /^@kagadmodyaa\/sketchbook$/,
        replacement: fileURLToPath(new URL('./vendor/sketchbook/index.ts', import.meta.url)),
      },
    ],
  },
})
