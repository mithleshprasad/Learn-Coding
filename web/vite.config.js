import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { askGroq } from './api/_groq.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' as the third arg loads every var in .env*, not just VITE_-prefixed
  // ones — GROQ_API_KEY is deliberately unprefixed so it never leaks into
  // the client bundle via import.meta.env.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'dev-api-search',
        configureServer(server) {
          server.middlewares.use('/api/search', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end()
              return
            }

            const apiKey = env.GROQ_API_KEY
            res.setHeader('Content-Type', 'application/json')
            if (!apiKey) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Set GROQ_API_KEY in .env.local to use Ask AI locally.' }))
              return
            }

            try {
              const chunks = []
              for await (const chunk of req) chunks.push(chunk)
              const { question, context } = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

              if (!question || typeof question !== 'string' || !question.trim()) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'A question is required.' }))
                return
              }

              const answer = await askGroq({ apiKey, question, context })
              res.statusCode = 200
              res.end(JSON.stringify({ answer }))
            } catch (err) {
              res.statusCode = err.status || 502
              res.end(JSON.stringify({ error: err.message, detail: err.detail }))
            }
          })
        },
      },
    ],
  }
})
