import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 3001, // Different port from rspeedy (3000 is for rspeedy)
    host: true, // Allow access from network
    publicDir: [
      {
        name: path.join(__dirname, '../dist'),
      },
    ],
  },
})

