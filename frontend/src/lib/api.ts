// 프론트-백엔드 연결 공용 헬퍼. mocks/*.ts의 TODO(backend) 지점에서
// `await fetch(\`${API_BASE}/...\`, ...)` 대신 `await apiFetch("/...")`를 사용하면 됩니다.

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000"

const TOKEN_STORAGE_KEY = "kb_access_token"

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const token = getAuthToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new ApiError(res.status, detail || `요청에 실패했어요 (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
