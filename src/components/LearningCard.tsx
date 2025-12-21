import React from 'react'
import './LearningCard.css'
import { playPronunciation } from '../services/pronunciationService'

interface WordData {
  english: string
  ipaUk: string
  chinese: string
  exampleEn: string
  exampleZh: string
  relatedWords: Array<{ english: string; chinese: string }>
}

interface LearningCardProps {
  data: WordData
  onSave?: () => void
  onContinue?: () => void
}

export default function LearningCard({ data, onSave, onContinue }: LearningCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [isPlayingPronunciation, setIsPlayingPronunciation] = React.useState(false)

  const handleCopyWord = () => {
    navigator.clipboard.writeText(data.english)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveWord = () => {
    onSave?.()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handlePlayPronunciation = async () => {
    setIsPlayingPronunciation(true)
    try {
      await playPronunciation(data.english)
    } catch (err) {
      console.error('发音播放失败:', err)
    } finally {
      setIsPlayingPronunciation(false)
    }
  }

  return (
    <div className="learning-card-container">
      <div 
        className={`learning-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-front">
          <div className="word-section">
            <p className="label">英文单词</p>
            <h2 className="word">{data.english}</h2>
            <p className="ipa">{data.ipaUk}</p>
            <button 
              className="copy-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyWord()
              }}
              title="复制单词"
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
          </div>
        </div>

        <div className="card-back">
          <div className="meaning-section">
            <p className="label">中文释义</p>
            <p className="meaning">{data.chinese}</p>
          </div>
          <div className="example-section">
            <p className="label">例句</p>
            <p className="example">EN: "{data.exampleEn}"</p>
            <p className="example example-zh">ZH: {data.exampleZh}</p>
          </div>

          {data.relatedWords.length > 0 && (
            <div className="related-section">
              <p className="label">相关词扩展</p>
              <div className="related-list">
                {data.relatedWords.map((w) => (
                  <div key={w.english} className="related-item">
                    <span className="related-en">{w.english}</span>
                    <span className="related-sep">—</span>
                    <span className="related-zh">{w.chinese}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="flip-hint">点击卡片查看中文含义和例句</p>

      <div className="learning-actions">
        <button 
          className={`action-btn favorite-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveWord}
          title="收藏单词"
        >
          {isSaved ? '✓ 已收藏' : '❤️ 收藏'}
        </button>
        <button 
          className="action-btn pronunciation-btn" 
          onClick={handlePlayPronunciation}
          disabled={isPlayingPronunciation}
          title="发音"
        >
          {isPlayingPronunciation ? '🔊 播放中...' : '🔊 发音'}
        </button>
        <button 
          className="action-btn new-btn" 
          onClick={onContinue}
          title="识别新图片"
        >
          ➕ 继续学习
        </button>
      </div>
    </div>
  )
}
