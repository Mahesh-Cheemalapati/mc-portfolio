import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../content/**/*.{md,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
