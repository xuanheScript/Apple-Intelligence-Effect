import { useState } from 'react'
import { AppleIntelligenceGlow, AppleIntelligenceLockScreen } from 'apple-intelligence-lock-screen'
import './App.css'

function App() {
  const [isActive1, setIsActive1] = useState(true)
  const [isPaused1, setIsPaused1] = useState(false)
  const [isActive2, setIsActive2] = useState(true)
  const [isPaused2, setIsPaused2] = useState(false)

  return (
    <div className="demo-container">
      <h1 className="demo-title">Apple Intelligence Glow Demo</h1>
      <p className="demo-subtitle">React component for Apple Intelligence style glow effect</p>

      <div className="demo-grid">
        {/* Demo 1: 自定义内容 + Glow */}
        <div className="demo-section">
          <h2 className="demo-section-title">Custom Content + Glow</h2>

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

          <AppleIntelligenceGlow
            isActive={isActive1}
            isPaused={isPaused1}
            radius={50}
            className="demo-card"
          >
            <div className="card-content">
              <div className="card-icon">🍎</div>
              <div className="card-title">Custom Card</div>
              <div className="card-desc">Any content works here</div>
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

        {/* Demo 3: 小卡片 */}
        <div className="demo-section">
          <h2 className="demo-section-title">Small Cards</h2>

          <div className="small-cards-grid">
            <AppleIntelligenceGlow radius={16} className="small-card">
              <div className="small-card-content">
                <span>📱</span>
                <span>Messages</span>
              </div>
            </AppleIntelligenceGlow>

            <AppleIntelligenceGlow radius={16} className="small-card">
              <div className="small-card-content">
                <span>📧</span>
                <span>Mail</span>
              </div>
            </AppleIntelligenceGlow>

            <AppleIntelligenceGlow radius={16} className="small-card">
              <div className="small-card-content">
                <span>🎵</span>
                <span>Music</span>
              </div>
            </AppleIntelligenceGlow>

            <AppleIntelligenceGlow radius={16} className="small-card">
              <div className="small-card-content">
                <span>📸</span>
                <span>Photos</span>
              </div>
            </AppleIntelligenceGlow>
          </div>
        </div>
      </div>

      <footer className="demo-footer">
        <p>npm install apple-intelligence-lock-screen</p>
      </footer>
    </div>
  )
}

export default App
