// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import worker, { SITE_PER_DAY, VISITOR_PER_DAY } from './index.js'

vi.mock('./images.js', () => ({
  IMAGES: Object.fromEntries(['blue', 'beige', 'lines', 'yellow', 'green'].map((id) => [id, new Uint8Array([0xff, 0xd8, 0xff, 1])])),
}))

const SITE = 'https://anna8295.github.io'
const jpeg = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])], 'dog.jpg', { type: 'image/jpeg' })

function request({ garment = 'blue', photo = jpeg(), width = '768', height = '1024', origin = SITE } = {}) {
  const form = new FormData()
  if (garment) form.append('garment', garment)
  if (photo) form.append('photo', photo)
  form.append('width', width)
  form.append('height', height)
  return new Request('https://try-on.example/try-on', { method: 'POST', body: form, headers: { Origin: origin, 'CF-Connecting-IP': '1.2.3.4' } })
}

function env({ counts = {}, run = async () => ({ image: 'AAAA' }), limited = false } = {}) {
  const store = new Map(Object.entries(counts))
  return {
    store,
    AI: { run: vi.fn(run) },
    LIMITER: { limit: vi.fn(async () => ({ success: !limited })) },
    COUNTS: { get: vi.fn(async (k) => store.get(k) ?? null), put: vi.fn(async (k, v) => void store.set(k, v)) },
  }
}

const day = () => new Date().toISOString().slice(0, 10)

describe('try-on worker', () => {
  it('dresses the dog, counts the try-on and says how many are left', async () => {
    const e = env()
    const res = await worker.fetch(request({ garment: 'yellow' }), e)

    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
    expect(await res.json()).toEqual({ image: 'AAAA', remaining: VISITOR_PER_DAY - 1 })
    expect(e.store.get(`site:${day()}`)).toBe('1')
    // the visitor is kept only as a hash, never the IP address itself
    const visitorKeys = [...e.store.keys()].filter((k) => k.startsWith('visitor:'))
    expect(visitorKeys).toHaveLength(1)
    expect(visitorKeys[0]).not.toContain('1.2.3.4')

    const [model, input] = e.AI.run.mock.calls[0]
    expect(model).toBe('@cf/black-forest-labs/flux-2-klein-4b')
    const sent = await new Response(input.multipart.body, { headers: { 'Content-Type': input.multipart.contentType } }).formData()
    expect(sent.get('prompt')).toMatch(/mustard-yellow dog rain slicker/)
    expect(sent.get('input_image_0')).toBeInstanceOf(File)
    expect(sent.get('input_image_1')).toBeInstanceOf(File)
    expect(sent.get('width')).toBe('768')
  })

  it('stops at the daily limit for the whole site', async () => {
    const e = env({ counts: { [`site:${day()}`]: String(SITE_PER_DAY) } })
    const res = await worker.fetch(request(), e)
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'site' })
    expect(e.AI.run).not.toHaveBeenCalled()
  })

  it('stops at three a day for one visitor', async () => {
    const e = env()
    for (let i = 0; i < VISITOR_PER_DAY; i++) expect((await worker.fetch(request(), e)).status).toBe(200)
    const res = await worker.fetch(request(), e)
    expect(await res.json()).toEqual({ error: 'visitor' })
  })

  it('does not count a picture that failed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const e = env({ run: async () => { throw new Error('3036: You have used up your daily free allocation of 10,000 neurons') } })
    const res = await worker.fetch(request(), e)
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'quota' })
    expect(e.store.size).toBe(0)
  })

  it.each([
    ['an unknown garment', { garment: 'tutu' }, 'garment'],
    ['a photo that is not a JPEG', { photo: new File(['<svg>'], 'x.svg', { type: 'image/svg+xml' }) }, 'photo'],
    ['a size that is not a multiple of 16', { width: '770' }, 'size'],
    ['a size that is too big', { height: '4096' }, 'size'],
  ])('refuses %s', async (_, options, error) => {
    const res = await worker.fetch(request(options), env())
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error })
  })

  it('refuses other websites, and visitors sending too fast', async () => {
    expect((await worker.fetch(request({ origin: 'https://evil.example' }), env())).status).toBe(403)
    expect((await worker.fetch(request(), env({ limited: true }))).status).toBe(429)
  })
})
