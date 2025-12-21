type PronunciationEntry = {
  blob: Blob
  objectUrl: string
  audio: HTMLAudioElement
}

// 发音缓存存储（已完成）
const pronunciationCache = new Map<string, PronunciationEntry>()

// 发音缓存存储（请求中，避免并发重复拉取）
const pronunciationInFlight = new Map<string, Promise<PronunciationEntry>>()

function normalizeWord(word: string): string {
  return word.trim().toLowerCase()
}

type DictionaryEntry = {
  phonetics?: Array<{ audio?: string }>
}

async function fetchDictionaryAudioUrl(word: string): Promise<string> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('获取词典信息失败')
  }

  const data = (await response.json()) as unknown
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('词典未返回发音信息')
  }

  const entries = data as DictionaryEntry[]
  for (const entry of entries) {
    const phonetics = Array.isArray(entry.phonetics) ? entry.phonetics : []
    for (const p of phonetics) {
      const audio = String(p?.audio ?? '').trim()
      if (!audio) continue

      // 有些返回的是以 // 开头的协议相对 URL
      if (audio.startsWith('//')) return `https:${audio}`
      return audio
    }
  }

  throw new Error('未找到可用的发音音频链接')
}

async function loadPronunciationEntry(word: string): Promise<PronunciationEntry> {
  const cacheKey = normalizeWord(word)

  const cached = pronunciationCache.get(cacheKey)
  if (cached) return cached

  const inflight = pronunciationInFlight.get(cacheKey)
  if (inflight) return inflight

  const task = (async (): Promise<PronunciationEntry> => {
    const audioUrl = await fetchDictionaryAudioUrl(cacheKey)
    const audioResp = await fetch(audioUrl)
    if (!audioResp.ok) {
      throw new Error('获取音频失败')
    }

    const blob = await audioResp.blob()
    const objectUrl = URL.createObjectURL(blob)
    const audio = new Audio(objectUrl)
    audio.preload = 'auto'
    audio.load()

    const entry: PronunciationEntry = { blob, objectUrl, audio }
    pronunciationCache.set(cacheKey, entry)
    return entry
  })()

  pronunciationInFlight.set(cacheKey, task)

  try {
    return await task
  } finally {
    pronunciationInFlight.delete(cacheKey)
  }
}

/**
 * 获取单词发音的音频Blob
 * 如果缓存中有，直接返回；否则调用API获取并缓存
 */
export async function getPronunciationAudio(word: string): Promise<Blob> {
  try {
    const entry = await loadPronunciationEntry(word)
    return entry.blob
  } catch (error) {
    console.warn(`无法获取 ${word} 的音频文件，将使用Web Speech API:`, error)
    // 如果获取音频失败，抛出异常让调用者使用Web Speech API
    throw error
  }
}

/**
 * 预缓存发音（识别完成后调用），不播放
 */
export async function prefetchPronunciation(word: string): Promise<void> {
  await loadPronunciationEntry(word)
}

/**
 * 播放缓存的音频
 */
export function playAudioBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play().catch(err => {
    console.error('播放音频失败:', err)
  })
  
  // 播放完成后释放URL
  audio.onended = () => {
    URL.revokeObjectURL(url)
  }
}

/**
 * 使用Web Speech API播放发音（备选方案）
 */
export function playWithSpeechAPI(word: string): void {
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-GB'
  window.speechSynthesis.cancel() // 取消之前的播放
  window.speechSynthesis.speak(utterance)
}

/**
 * 播放发音（优先使用缓存的音频，失败则使用Web Speech API）
 */
export async function playPronunciation(word: string): Promise<void> {
  try {
    const entry = await loadPronunciationEntry(word)
    // 复用同一个 Audio 元素，避免用户点击时再触发网络/加载开销
    try {
      entry.audio.currentTime = 0
    } catch {
      // 某些浏览器在未就绪时设置 currentTime 可能抛错，忽略即可
    }
    await entry.audio.play()
  } catch (error) {
    console.warn('使用Web Speech API作为备选方案')
    playWithSpeechAPI(word)
  }
}
