import { useState } from 'react'
import './App.css'
import ImageUploader from './components/ImageUploader.tsx'
import SampleGallery from './components/SampleGallery.tsx'
import LearningCard from './components/LearningCard.tsx'
import { recognizeObject, type WordData } from './services/vlmService.ts'
import { prefetchPronunciation } from './services/pronunciationService.ts'

function App() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [wordData, setWordData] = useState<WordData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [learnedWords, setLearnedWords] = useState<WordData[]>([])

  const handleImageSelected = async (url: string) => {
    setImageUrl(url)
    setError('')
    setWordData(null)
    setLoading(true)

    try {
      const result = await recognizeObject(url)
      setWordData(result)
      
      // 在后台缓存发音，不阻塞主流程
      prefetchPronunciation(result.english).catch(err => {
        console.warn('发音缓存失败，用户点击时将使用Web Speech API:', err)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败，请重试')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWord = () => {
    if (wordData && !learnedWords.some(w => w.english === wordData.english)) {
      setLearnedWords([...learnedWords, wordData])
    }
  }

  const handleContinue = () => {
    setImageUrl('')
    setWordData(null)
    setError('')
  }


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📸 SnapWord</h1>
        <p>拍照学英语，从生活场景开始</p>
        <p className="model-note">通义千问3-VL-Flash 支持多模态理解</p>
      </header>

      <main className="app-main">
        <SampleGallery onSampleSelected={handleImageSelected} disabled={loading} />
        <ImageUploader onImageSelected={handleImageSelected} disabled={loading} />

        {learnedWords.length > 0 && (
          <div className="learned-words-summary">
            <p>✨ 已学单词数: <span>{learnedWords.length}</span></p>
          </div>
        )}

        {imageUrl && (
          <div className="image-preview-section">
            <img src={imageUrl} alt="上传的图片" className="image-preview" />
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>正在识别图片中的物体...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {wordData && (
          <LearningCard 
            data={wordData} 
            onSave={handleSaveWord}
            onContinue={handleContinue}
          />
        )}
      </main>
    </div>
  )
}

export default App
