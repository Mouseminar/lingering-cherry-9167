# 📸 SnapWord - 英语学习应用

SnapWord 是一个创新的英语学习应用，让用户能够通过拍照来学习英文单词。用户在日常生活中遇到不认识的英文单词时，可以直接用手机拍照，系统通过 AI 自动识别图片中的主要物体，并返回对应的英文单词、中文释义和示例句子。

## ✨ 核心功能

- 📱 **图片上传方式**：支持手机拍照和本地图片上传
- 🤖 **AI物体识别**：使用阿里云视觉语言模型（VLM）识别图片中的主要物体
- 📚 **完整学习信息**：
  - 英文单词（单数形式）
  - 中文含义
  - 简单的英文例句
- 🎯 **交互式学习卡片**：翻转卡片查看中文含义和例句
- 📋 **单词复制**：一键复制英文单词
- 🔊 **发音功能**：点击发音按钮听英文单词发音
- ❤️ **收藏功能**：收藏学过的单词，跟踪学习进度

## 🚀 快速开始

### 前提条件
- Node.js 20.19+ 或 22.12+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

然后打开浏览器访问 `http://localhost:5173/`

### 编译构建
```bash
npm run build
```

## 🔑 环境变量配置

应用需要配置 Aliyun DashScope API 密钥。在项目根目录的 `.env` 文件中配置：

```env
VITE_DASHSCOPE_API_KEY='你的API密钥'
VITE_DASHSCOPE_BASE_URL='https://dashscope.aliyuncs.com/compatible-mode/v1'
```

> **获取API密钥**：访问 [Aliyun Model Studio](https://help.aliyun.com/zh/model-studio/get-api-key)

## 📂 项目结构

```
src/
├── components/              # React 组件
│   ├── ImageUploader.tsx    # 图片上传组件
│   ├── ImageUploader.css
│   ├── LearningCard.tsx     # 学习卡片组件
│   └── LearningCard.css
├── services/                # 业务逻辑服务
│   └── vlmService.ts        # VLM 识别服务
├── App.tsx                  # 主应用组件
├── App.css
├── main.tsx
└── index.css
```

## 🎨 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式**：CSS3（含渐变、动画）
- **API 调用**：OpenAI SDK（兼容 Aliyun DashScope）
- **IDE 支持**：ESLint + TypeScript

## 🌟 使用流程

1. **打开应用**：访问应用首页
2. **选择图片**：
   - 点击"📷 拍照"用手机相机拍照
   - 点击"🖼️ 上传本地图片"从本地选择
3. **查看识别结果**：
   - 英文单词显示在卡片正面
   - 点击卡片翻转查看中文释义和例句
4. **学习互动**：
   - 📋 复制单词到剪贴板
   - 🔊 点击发音听英文发音
   - ❤️ 收藏单词，跟踪学习进度
   - ➕ 继续学习其他单词

## 📝 API 说明

### 识别服务 (`vlmService.ts`)

**函数**: `recognizeObject(imageUrl: string)`

**参数**:
- `imageUrl` (string): 图片的 URL 地址（支持 base64 data URL 和网络 URL）

**返回值**:
```typescript
{
  english: string     // 英文单词（小写）
  chinese: string     // 中文含义
  example: string     // 英文例句
}
```

**示例**:
```typescript
const result = await recognizeObject('data:image/jpeg;base64,...');
console.log(result);
// 输出: { english: "cat", chinese: "猫咪", example: "The cat is sleeping." }
```

## 🎯 学习效果

- **场景化学习**：从真实物体图片中学习单词
- **多感官学习**：视觉 + 听觉 + 阅读
- **即时反馈**：快速获得识别结果
- **进度追踪**：记录已学单词数

## 💡 使用建议

1. 拍摄清晰的物体照片以获得最佳识别结果
2. 尽量确保物体是图片的主要内容
3. 定期复习已收藏的单词
4. 在真实生活中应用学到的单词

## 🐛 常见问题

**Q: 识别不准确怎么办？**
A: 请确保图片清晰，物体明显，背景简洁。如问题继续，可以尝试换个角度重新拍照。

**Q: 可以离线使用吗？**
A: 不可以，应用需要网络连接以调用 Aliyun DashScope API。

**Q: 收藏的单词保存在哪里？**
A: 目前收藏的单词保存在浏览器本地状态中，刷新页面后会丢失。未来版本可添加云同步功能。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**祝你学习愉快！** 📚✨
```
