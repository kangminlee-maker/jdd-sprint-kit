const BASE_URL = '/api'
const VERSION = '/v1'

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${VERSION}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(`GET ${path}: ${res.status}`) as Error & { status: number; body: unknown }
    err.status = res.status
    err.body = body
    throw err
  }
  return res.json()
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${VERSION}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const respBody = await res.json().catch(() => ({}))
    const err = new Error(`POST ${path}: ${res.status}`) as Error & { status: number; body: unknown }
    err.status = res.status
    err.body = respBody
    throw err
  }
  return res.json()
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${VERSION}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const respBody = await res.json().catch(() => ({}))
    const err = new Error(`PUT ${path}: ${res.status}`) as Error & { status: number; body: unknown }
    err.status = res.status
    err.body = respBody
    throw err
  }
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${VERSION}${path}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(`DELETE ${path}: ${res.status}`) as Error & { status: number; body: unknown }
    err.status = res.status
    err.body = body
    throw err
  }
  return res.json()
}
