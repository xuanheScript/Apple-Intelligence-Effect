import React, { useState, useEffect, useCallback } from 'react'
import { AppleIntelligenceGlow, AppleIntelligenceLockScreen, GlowState } from 'apple-intelligence-glow-react'
import './App.css'

// 从 vite.config.js 注入的仓库地址
declare const __GITHUB_REPO__: string
const GITHUB_REPO = typeof __GITHUB_REPO__ !== 'undefined' ? __GITHUB_REPO__ : 'xuanheScript/Apple-Intelligence-Effect'

const STREAMING_TEXT = `Apple Intelligence 是一个强大的人工智能系统，它能够理解上下文、生成创意内容，并以自然的方式与用户交流。

这个演示展示了 AI 响应时的视觉效果变化：
• 思考中 (Thinking) - 渐变动画表示处理中
• 成功 (Success) - Bloom 效果表示完成
• 错误 (Error) - 红色警示效果

通过这些视觉反馈，用户可以清晰地了解 AI 的当前状态。`

const STATES: GlowState[] = ['idle', 'hover', 'focus', 'thinking', 'success', 'error']

const STATE_LABELS: Record<GlowState, { label: string; desc: string }> = {
  idle: { label: '💤 Idle', desc: '几乎不可见' },
  hover: { label: '👆 Hover', desc: '轻微高亮' },
  focus: { label: '🎯 Focus', desc: '清晰聚焦' },
  thinking: { label: '🤔 Thinking', desc: 'AI 思考中' },
  success: { label: '✅ Success', desc: 'Bloom 效果' },
  error: { label: '❌ Error', desc: '单色警示' },
}

function App() {
  const [isActive1, setIsActive1] = useState(true)
  const [isPaused1, setIsPaused1] = useState(false)
  const [currentState, setCurrentState] = useState<GlowState>('thinking')
  const [isActive2, setIsActive2] = useState(true)
  const [isPaused2, setIsPaused2] = useState(false)

  // Streaming Demo State
  const [streamingState, setStreamingState] = useState<GlowState>('idle')
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [charIndex, setCharIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // 计算当前状态（优先级：streaming > focus > hover > idle/success）
  const computedStreamingState = useCallback((): GlowState => {
    if (isStreaming) return 'thinking'
    if (streamingText && !isStreaming) return 'success'
    if (isFocused) return 'focus'
    if (isHovered) return 'hover'
    return 'idle'
  }, [isStreaming, streamingText, isFocused, isHovered])

  // 更新状态
  useEffect(() => {
    setStreamingState(computedStreamingState())
  }, [computedStreamingState])

  // 开始 streaming
  const startStreaming = useCallback(() => {
    setStreamingText('')
    setCharIndex(0)
    setIsStreaming(true)
  }, [])

  // 初次加载时自动开始生成
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStreaming(true)
    }, 800) // 延迟 800ms 让用户先看到界面
    return () => clearTimeout(timer)
  }, [])

  // 重置
  const resetStreaming = useCallback(() => {
    setStreamingText('')
    setCharIndex(0)
    setIsStreaming(false)
  }, [])

  // 模拟 streaming 效果
  useEffect(() => {
    if (!isStreaming) return

    if (charIndex < STREAMING_TEXT.length) {
      const timer = setTimeout(() => {
        setStreamingText(prev => prev + STREAMING_TEXT[charIndex])
        setCharIndex(prev => prev + 1)
      }, 30 + Math.random() * 20) // 随机延迟模拟真实打字效果

      return () => clearTimeout(timer)
    } else {
      setIsStreaming(false)
    }
  }, [isStreaming, charIndex])

  return (
    <div className="demo-container">
      <h1 className="demo-title">Apple Intelligence Glow Demo</h1>
      <p className="demo-subtitle">React component for Apple Intelligence style glow effect</p>

      <div className="demo-grid">
        {/* Demo 1: 状态切换 */}
        <div className="demo-section">
          <h2 className="demo-section-title">State Control</h2>

          <div className="demo-controls">
            <button
              className={`demo-btn ${isActive1 ? 'active' : ''}`}
              onClick={() => setIsActive1(!isActive1)}
            >
              {isActive1 ? '✓ Active' : '○ Inactive'}
            </button>
            <button
              className={`demo-btn ${isPaused1 ? 'paused' : ''}`}
              onClick={() => setIsPaused1(!isPaused1)}
              disabled={!isActive1}
            >
              {isPaused1 ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>

          <div className="state-selector">
            {STATES.map((state) => (
              <button
                key={state}
                className={`state-btn ${currentState === state ? 'selected' : ''}`}
                onClick={() => setCurrentState(state)}
              >
                {STATE_LABELS[state].label}
              </button>
            ))}
          </div>

          <AppleIntelligenceGlow
            isActive={isActive1}
            isPaused={isPaused1}
            state={currentState}
            radius={50}
            className="demo-card"
          >
            <div className="card-content">
              <div className="card-icon">🍎</div>
              <div className="card-title">State: {currentState}</div>
              <div className="card-desc">{STATE_LABELS[currentState].desc}</div>
              <div className="card-status">
                {!isActive1 ? 'Glow disabled' : isPaused1 ? 'Animation paused' : 'Animating...'}
              </div>
            </div>
          </AppleIntelligenceGlow>
        </div>

        {/* Demo 2: AppleIntelligenceLockScreen 组件 */}
        <div className="demo-section">
          <h2 className="demo-section-title">Lock Screen Component</h2>

          <div className="demo-controls">
            <button
              className={`demo-btn ${isActive2 ? 'active' : ''}`}
              onClick={() => setIsActive2(!isActive2)}
            >
              {isActive2 ? '✓ Active' : '○ Inactive'}
            </button>
            <button
              className={`demo-btn ${isPaused2 ? 'paused' : ''}`}
              onClick={() => setIsPaused2(!isPaused2)}
              disabled={!isActive2}
            >
              {isPaused2 ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>

          <AppleIntelligenceLockScreen
            width={280}
            height={560}
            isActive={isActive2}
            isPaused={isPaused2}
          />
        </div>

        {/* Demo 3: Streaming 模拟 */}
        <div className="demo-section">
          <h2 className="demo-section-title">AI Streaming Input</h2>

          <div className="demo-controls">
            <button
              className="demo-btn start-btn"
              onClick={startStreaming}
              disabled={isStreaming}
            >
              {isStreaming ? '⏳ 生成中...' : '✨ 生成'}
            </button>
            <button
              className="demo-btn"
              onClick={resetStreaming}
              disabled={isStreaming}
            >
              🔄 重置
            </button>
          </div>

          <div className="streaming-state-indicator">
            当前: <strong>{STATE_LABELS[streamingState].label}</strong>
          </div>

          <AppleIntelligenceGlow
            state={streamingState}
            radius={24}
            className="streaming-textarea-wrapper"
          >
            <textarea
              className="streaming-textarea"
              value={streamingText}
              readOnly
              placeholder="悬停、点击聚焦，或点击「生成」按钮..."
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {isStreaming && <span className="streaming-cursor">|</span>}
          </AppleIntelligenceGlow>

          <div className="streaming-hint">
            idle → hover → focus → thinking → success
          </div>
        </div>

        {/* Demo 4: 所有状态预览 */}
        <div className="demo-section demo-section-wide">
          <h2 className="demo-section-title">All States Preview</h2>

          <div className="states-grid">
            {STATES.map((state) => (
              <div key={state} className="state-preview">
                <AppleIntelligenceGlow
                  state={state}
                  radius={20}
                  className="state-preview-card"
                >
                  <div className="state-preview-content">
                    <span className="state-preview-icon">
                      {STATE_LABELS[state].label.split(' ')[0]}
                    </span>
                    <span className="state-preview-label">{state}</span>
                  </div>
                </AppleIntelligenceGlow>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="demo-footer">
        <p className="demo-footer-install">npm install apple-intelligence-glow-react</p>
        <div className="demo-footer-links">
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="demo-footer-link"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/apple-intelligence-glow-react"
            target="_blank"
            rel="noopener noreferrer"
            className="demo-footer-link"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
            </svg>
            npm
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
