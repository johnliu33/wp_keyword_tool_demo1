# 🔐 認證系統完整實作指南

這份文件提供完整的 Supabase Auth 整合程式碼範例，可直接複製使用。

## 📁 檔案結構

```
your-project/
├── lib/
│   └── supabase/
│       ├── client.ts          # 瀏覽器端 Supabase client
│       ├── server.ts          # 服務端 Supabase client
│       └── middleware.ts      # Middleware helper
├── middleware.ts              # Next.js Middleware（根目錄）
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx       # 登入頁面
│   │   ├── signup/
│   │   │   └── page.tsx       # 註冊頁面
│   │   └── layout.tsx         # Auth Layout
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # OAuth Callback
│   └── (dashboard)/
│       ├── layout.tsx         # Dashboard Layout
│       └── dashboard/
│           └── page.tsx       # Dashboard 主頁
└── components/
    └── auth/
        ├── LoginForm.tsx      # 登入表單
        ├── SignupForm.tsx     # 註冊表單
        └── LogoutButton.tsx   # 登出按鈕
```

---

## 1️⃣ Supabase Client 設定

### 📄 `lib/supabase/client.ts` (瀏覽器端)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### 📄 `lib/supabase/server.ts` (服務端)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // 在 Server Component 中呼叫 set 會失敗，這是正常的
            // 只在 Server Actions 或 Route Handlers 中才能設定 cookie
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // 同上
          }
        },
      },
    }
  )
}
```

---

### 📄 `lib/supabase/middleware.ts` (Middleware Helper)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 刷新 session（如果過期會自動更新）
  await supabase.auth.getUser()

  return response
}
```

---

## 2️⃣ Next.js Middleware（路由保護）

### 📄 `middleware.ts` (根目錄)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 符合所有路徑，除了：
     * - _next/static (靜態檔案)
     * - _next/image (圖片優化)
     * - favicon.ico (favicon)
     * - 圖片檔案 (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 3️⃣ 認證頁面

### 📄 `app/(auth)/layout.tsx` (Auth Layout)

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 如果已登入，重導向到 dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  )
}
```

---

### 📄 `app/(auth)/login/page.tsx` (登入頁面)

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          登入您的帳號
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          或{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            建立新帳號
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="密碼"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </div>

        {/* Google OAuth (V2 功能) */}
        {/*
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">或使用</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            使用 Google 登入
          </button>
        </div>
        */}
      </form>
    </div>
  )
}
```

---

### 📄 `app/(auth)/signup/page.tsx` (註冊頁面)

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          name,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // 如果沒有啟用 email 驗證，直接登入
      // 如果有啟用，顯示提示訊息
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          註冊成功！
        </h2>
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            請檢查您的信箱以確認註冊。
          </p>
        </div>
        <div className="mt-4">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            返回登入頁面
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          建立新帳號
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          已有帳號？{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            立即登入
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSignup}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="name" className="sr-only">
              姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="relative block w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="姓名"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="密碼（至少 6 字元）"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

### 📄 `app/auth/callback/route.ts` (OAuth Callback)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 如果有錯誤，重導向到登入頁面並顯示錯誤
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

---

## 4️⃣ Dashboard（受保護的頁面）

### 📄 `app/(dashboard)/layout.tsx` (Dashboard Layout)

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // 如果未登入，重導向到登入頁面
  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  WP Keyword AI Tool
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

---

### 📄 `app/(dashboard)/dashboard/page.tsx` (Dashboard 主頁)

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        歡迎回來！
      </h2>
      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">
          使用者資訊
        </h3>
        <dl className="mt-4 space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">建立時間</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleString('zh-TW') : '-'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
```

---

## 5️⃣ 登出按鈕組件

### 📄 `components/auth/LogoutButton.tsx`

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
    >
      登出
    </button>
  )
}
```

---

## 6️⃣ 在 API Route 中使用認證

### 📄 `app/api/protected/route.ts` (範例)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 使用者已認證，執行受保護的邏輯
  return NextResponse.json({
    message: 'This is a protected endpoint',
    userId: user.id,
  })
}
```

---

## 7️⃣ 在 Client Component 中取得使用者

### 範例：使用 useEffect

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div>載入中...</div>
  }

  if (!user) {
    return <div>未登入</div>
  }

  return (
    <div>
      <p>歡迎, {user.email}</p>
    </div>
  )
}
```

---

## ✅ 完成檢查清單

實作認證系統時，請確認：

- [ ] 已建立所有 Supabase client 檔案
- [ ] 已設定 Next.js Middleware
- [ ] 已建立登入頁面
- [ ] 已建立註冊頁面
- [ ] 已建立 OAuth Callback route
- [ ] 已建立受保護的 Dashboard Layout
- [ ] 已建立登出按鈕
- [ ] 已在 Supabase 設定 Redirect URLs
- [ ] 已測試登入流程
- [ ] 已測試註冊流程
- [ ] 已測試登出功能
- [ ] 已測試路由保護（未登入訪問 /dashboard 會重導向）

---

## 🔒 安全性提醒

1. **環境變數：**
   - `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 可公開
   - `SUPABASE_SERVICE_ROLE_KEY` 絕不可洩漏，僅在後端使用

2. **Row Level Security：**
   - 務必在 Supabase 啟用 RLS
   - 套用 `supabase/rls-policies.sql` 中的 Policies

3. **密碼要求：**
   - 最少 6 字元（可在 Supabase 設定中調整）
   - 建議提示使用者設定強密碼

4. **HTTPS：**
   - 生產環境務必使用 HTTPS
   - Vercel 自動提供 SSL 憑證

---

## 📚 參考資源

- [Supabase Auth 文件](https://supabase.com/docs/guides/auth)
- [Next.js Middleware 文件](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR 套件](https://github.com/supabase/auth-helpers)

---

**完成後，請繼續實作其他功能模組！** 🎉
