import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind()],
  vite: {
    resolve: {
      alias: {
        '@content': path.resolve(__dirname, '../../content'),
      },
    },
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(
        process.env.PUBLIC_API_URL ?? '',
      ),
    },
  },
})
