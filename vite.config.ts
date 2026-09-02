import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { pathToFileURL } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function localApiRoutes() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname
        const routeFiles = {
          '/api/automations/subscribe': 'api/automations/subscribe.js',
          '/api/automations/vault-waitlist': 'api/automations/vault-waitlist.js',
        }
        const routeFile = routeFiles[pathname]

        if (!routeFile) {
          next()
          return
        }

        try {
          const moduleUrl = pathToFileURL(path.resolve(__dirname, routeFile)).href
          const handler = (await import(`${moduleUrl}?t=${Date.now()}`)).default
          await handler(request, response)
        } catch (error) {
          console.error('Local API route failed', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ success: false, error: 'Local API route failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value
    }
  }

  return {
    plugins: [
      figmaAssetResolver(),
      localApiRoutes(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
