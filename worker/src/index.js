import { GARMENTS, prompt } from './garments.js'
import { IMAGES } from './images.js'

// FLUX.2 [klein] 4B edits a photo using reference images. On the free plan it
// costs about 126 of the 10,000 daily Neurons per 768×1024 picture. The
// allowance is shared with the account's other Workers, hence the daily cap.
const MODEL = '@cf/black-forest-labs/flux-2-klein-4b'
export const SITE_PER_DAY = 40
export const VISITOR_PER_DAY = 3
const MAX_PHOTO_BYTES = 2_000_000

const SITE = 'https://anna8295.github.io'
const allowed = (origin) => origin === SITE || /^http:\/\/localhost:\d+$/.test(origin)
const json = (body, status, headers) => Response.json(body, { status, headers })

// The visitor's IP address is only kept as a hash with today's date, for the
// per-visitor count, and the counters delete themselves after two days.
async function visitorId(ip, day) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${day}:${ip}`))
  return [...new Uint8Array(bytes)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const isJpeg = async (file) => {
  const head = new Uint8Array(await file.slice(0, 3).arrayBuffer())
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
}

// output size: what the site sends, a multiple of 16 between 256 and 1024
const side = (value) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 256 && n <= 1024 && n % 16 === 0 ? n : null
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    if (!allowed(origin)) return json({ error: 'origin' }, 403)
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/try-on') return json({ error: 'not found' }, 404, cors)

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    if (env.LIMITER && !(await env.LIMITER.limit({ key: ip })).success) return json({ error: 'slow' }, 429, cors)

    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_PHOTO_BYTES + 10_000) return json({ error: 'too big' }, 413, cors)
    const form = await request.formData().catch(() => null)
    const garment = form?.get('garment')
    const photo = form?.get('photo')
    const width = side(form?.get('width'))
    const height = side(form?.get('height'))
    if (typeof garment !== 'string' || !GARMENTS[garment]) return json({ error: 'garment' }, 400, cors)
    if (!(photo instanceof File) || photo.size > MAX_PHOTO_BYTES || !(await isJpeg(photo))) return json({ error: 'photo' }, 400, cors)
    if (!width || !height) return json({ error: 'size' }, 400, cors)

    // daily limits (UTC day)
    const day = new Date().toISOString().slice(0, 10)
    const siteKey = `site:${day}`
    const visitorKey = `visitor:${day}:${await visitorId(ip, day)}`
    const [site, visitor] = (await Promise.all([env.COUNTS.get(siteKey), env.COUNTS.get(visitorKey)])).map((v) => Number(v ?? 0))
    if (site >= SITE_PER_DAY) return json({ error: 'site' }, 429, cors)
    if (visitor >= VISITOR_PER_DAY) return json({ error: 'visitor' }, 429, cors)

    const input = new FormData()
    input.append('prompt', prompt(garment))
    input.append('input_image_0', new File([photo], 'dog.jpg', { type: 'image/jpeg' }))
    input.append('input_image_1', new File([IMAGES[garment]], `${garment}.jpg`, { type: 'image/jpeg' }))
    input.append('width', String(width))
    input.append('height', String(height))
    const multipart = new Response(input)

    let image
    try {
      const result = await env.AI.run(MODEL, {
        multipart: { body: multipart.body, contentType: multipart.headers.get('Content-Type') },
      })
      image = result?.image
      if (!image) throw new Error('no image')
    }
    catch (error) {
      const message = String(error?.message ?? error)
      console.error(message)
      return json({ error: /3036|daily free allocation/i.test(message) ? 'quota' : 'ai' }, 503, cors)
    }

    // only pictures that were made count
    const ttl = { expirationTtl: 2 * 24 * 60 * 60 }
    await Promise.all([env.COUNTS.put(siteKey, String(site + 1), ttl), env.COUNTS.put(visitorKey, String(visitor + 1), ttl)])
    return json({ image, remaining: VISITOR_PER_DAY - visitor - 1 }, 200, cors)
  },
}
