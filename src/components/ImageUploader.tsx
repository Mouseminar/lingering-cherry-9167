import React, { useRef } from 'react'
import './ImageUploader.css'

interface ImageUploaderProps {
  onImageSelected: (url: string) => void
  disabled?: boolean
}

export default function ImageUploader({ onImageSelected, disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        onImageSelected(url)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        onImageSelected(url)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="uploader-container">
      <div className="uploader-buttons">
        <button
          className="uploader-btn camera-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          title="使用相机拍照"
        >
          📷 拍照
        </button>
        <button
          className="uploader-btn upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="从本地选择图片"
        >
          🖼️ 上传本地图片
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />

      <p className="uploader-hint">
        💡 选择一张包含英文单词或物体的图片，我们会帮你识别并学习
      </p>
    </div>
  )
}
