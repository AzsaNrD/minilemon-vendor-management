import 'server-only'
import type { ReactElement } from 'react'

interface RenderOptions {
  format?: 'A4' | 'Letter'
  margin?: { top: string; right: string; bottom: string; left: string }
  inlineCss?: string
}

const DEFAULT_MARGIN = { top: '20mm', right: '18mm', bottom: '24mm', left: '18mm' }

/**
 * Renders a React element to PDF buffer via headless Chromium.
 * Uses puppeteer-core + @sparticuz/chromium (small bundle, Vercel-ready).
 * On local dev, falls back to a system-installed Chrome/Edge if PUPPETEER_EXECUTABLE_PATH is set.
 */
export async function renderPDF(element: ReactElement, opts: RenderOptions = {}): Promise<Buffer> {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const html = wrapHtml(renderToStaticMarkup(element), opts.inlineCss)

  const { default: puppeteer } = await import('puppeteer-core')
  const { default: chromium } = await import('@sparticuz/chromium')

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (await detectLocalChrome()) ||
    (await chromium.executablePath())

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const pdf = await page.pdf({
      format: opts.format || 'A4',
      printBackground: true,
      margin: opts.margin || DEFAULT_MARGIN,
      preferCSSPageSize: false,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

function wrapHtml(body: string, inlineCss?: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${inlineCss || ''}</style>
</head>
<body>${body}</body>
</html>`
}

async function detectLocalChrome(): Promise<string | undefined> {
  if (process.env.NODE_ENV === 'production') return undefined
  const { existsSync } = await import('node:fs')
  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        ]
      : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
  return candidates.find((p) => existsSync(p))
}

/** Helper to fetch S3 object and return as data URL for embedding in PDF. */
export async function fileKeyToDataUrl(fileKey: string): Promise<string | undefined> {
  if (!fileKey) return undefined
  try {
    const { getS3Object } = await import('./s3')
    const buffer = await getS3Object(fileKey)
    const ext = fileKey.split('.').pop()?.toLowerCase()
    const mime =
      ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch (e) {
    console.error('[pdf] failed to embed file', fileKey, e)
    return undefined
  }
}
