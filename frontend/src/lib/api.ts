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

// 로그인 UI가 아직 없어서, 토큰이 없으면 더미 인증정보로 자동 로그인해서 토큰을 확보한다.
// TODO(backend): 실제 로그인 화면이 생기면 이 자동 로그인 대신 사용자가 직접 로그인하도록 교체
let pendingLogin: Promise<string> | null = null

async function ensureAuthToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    const existing = getAuthToken()
    if (existing) return existing
  }

  if (!pendingLogin) {
    pendingLogin = fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "010-0000-0000", verificationCode: "000000" }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError(res.status, "자동 로그인에 실패했어요")
        return (await res.json()) as { accessToken: string }
      })
      .then((data) => {
        setAuthToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => {
        pendingLogin = null
      })
  }
  return pendingLogin
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const token = await ensureAuthToken()
  headers.set("Authorization", `Bearer ${token}`)

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // 저장된 토큰이 만료/무효화된 경우, 한 번 새로 로그인해서 재시도
  if (res.status === 401) {
    clearAuthToken()
    const freshToken = await ensureAuthToken(true)
    headers.set("Authorization", `Bearer ${freshToken}`)
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new ApiError(res.status, detail || `요청에 실패했어요 (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
