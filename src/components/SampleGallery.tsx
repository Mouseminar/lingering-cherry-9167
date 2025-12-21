import './SampleGallery.css'

interface SampleGalleryProps {
  onSampleSelected: (dataUrl: string) => void
  disabled?: boolean
}

function useSampleImages(): string[] {
  // 通过 Vite 的 import.meta.glob 收集根目录 images 下的图片资源
  const modules = import.meta.glob('../../images/*.{png,jpg,jpeg,gif,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>
  return Object.values(modules)
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function SampleGallery({ onSampleSelected, disabled = false }: SampleGalleryProps) {
  const images = useSampleImages()

  if (images.length === 0) {
    return null
  }

  const handleClick = async (url: string) => {
    if (disabled) return
    try {
      const dataUrl = await urlToDataUrl(url)
      onSampleSelected(dataUrl)
    } catch (e) {
      console.error('加载示例图片失败:', e)
    }
  }

  return (
    <div className="sample-gallery">
      <p className="gallery-title">🎯 立即体验：点击示例图片进行识别</p>
      <div className="gallery-grid">
        {images.map((url) => (
          <button
            key={url}
            className="gallery-item"
            onClick={() => handleClick(url)}
            disabled={disabled}
            title="点击识别此图片"
          >
            <img src={url} alt="示例图片" />
          </button>
        ))}
      </div>
    </div>
  )
}
