import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY,
  baseURL: import.meta.env.VITE_DASHSCOPE_BASE_URL,
  dangerouslyAllowBrowser: true,
})

export interface WordData {
  english: string
  ipaUk: string
  chinese: string
  exampleEn: string
  exampleZh: string
  relatedWords: Array<{ english: string; chinese: string }>
}

type RawWordData = {
  english?: unknown
  ipa_uk?: unknown
  chinese?: unknown
  example_en?: unknown
  example_zh?: unknown
  related_words?: unknown
}

function toWordData(raw: RawWordData): WordData {
  const english = String(raw.english ?? '').trim().toLowerCase()
  const ipaUk = String(raw.ipa_uk ?? '').trim()
  const chinese = String(raw.chinese ?? '').trim()
  const exampleEn = String(raw.example_en ?? '').trim()
  const exampleZh = String(raw.example_zh ?? '').trim()

  const relatedWords = Array.isArray(raw.related_words)
    ? raw.related_words
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const maybe = item as Record<string, unknown>
          const en = String(maybe.english ?? '').trim().toLowerCase()
          const zh = String(maybe.chinese ?? '').trim()
          if (!en || !zh) return null
          return { english: en, chinese: zh }
        })
        .filter((v): v is { english: string; chinese: string } => Boolean(v))
        .slice(0, 5)
    : []

  if (!english || !ipaUk || !chinese || !exampleEn || !exampleZh) {
    throw new Error('返回数据不完整')
  }

  return { english, ipaUk, chinese, exampleEn, exampleZh, relatedWords }
}

function extractJsonObject(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('无法解析API响应')
  return match[0]
}

export async function recognizeObject(imageUrl: string): Promise<WordData> {
  try {
    const response = await openai.chat.completions.create({
      model: 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: `请识别图片中最主要的物体或内容，并严格只返回一个JSON对象（不要代码块、不要解释文字）。

返回字段如下：
{
  "english": "英文单词（单数形式，小写）",
  "ipa_uk": "英式音标IPA，使用/ /包裹，例如 /ˈæp.əl/",
  "chinese": "中文含义（简短）",
  "example_en": "一个简单的英文例句（尽量与该物体相关）",
  "example_zh": "上面英文例句的中文翻译",
  "related_words": [
    {
      "english": "相关英文单词（单数形式，小写）",
      "chinese": "对应中文（简短）"
    }
  ]
}

示例输出：
{
  "english": "apple",
  "ipa_uk": "/ˈæp.əl/",
  "chinese": "苹果",
  "example_en": "I eat an apple every day.",
  "example_zh": "我每天吃一个苹果。",
  "related_words": [
    { "english": "banana", "chinese": "香蕉" },
    { "english": "pear", "chinese": "梨" },
    { "english": "orange", "chinese": "橙子" }
  ]
}`,
            },
          ],
        },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('API未返回内容')
    }

    const jsonText = extractJsonObject(content)
    const raw = JSON.parse(jsonText) as RawWordData
    return toWordData(raw)
  } catch (error) {
    console.error('识别失败:', error)
    if (error instanceof Error) {
      throw new Error(`识别失败: ${error.message}`)
    }
    throw new Error('识别失败，请重试')
  }
}
