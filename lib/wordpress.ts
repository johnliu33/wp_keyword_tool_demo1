import { decrypt } from './encryption'

export interface WordPressConfig {
  url: string
  username: string
  password: string
}

export interface WordPressPost {
  id?: number
  title: string
  content: string
  slug: string
  status: 'draft' | 'publish'
  meta?: {
    description?: string
  }
}

export async function testWordPressConnection(config: WordPressConfig) {
  try {
    const response = await fetch(`${config.url}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
      },
    })

    if (!response.ok) {
      throw new Error('WordPress 連線失敗')
    }

    return await response.json()
  } catch (error) {
    throw new Error('WordPress REST API 無法連接，請檢查網站 URL 和認證資訊')
  }
}

export async function publishToWordPress(
  config: WordPressConfig,
  post: WordPressPost
): Promise<any> {
  const response = await fetch(`${config.url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      meta: post.meta || {},
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WordPress 發佈失敗: ${error}`)
  }

  return await response.json()
}
