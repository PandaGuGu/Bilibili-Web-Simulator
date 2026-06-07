import { useRef, useState, useEffect, type CSSProperties } from 'react'
import { Send, Settings, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/common/utils/utils'
import {
  useDanmakuStore,
  DANMAKU_COLORS,
  type DanmakuFontSize,
  type DanmakuMode,
} from '@/store/danmaku'
import { useDanmakuEngine } from './useDanmakuEngine'

interface DanmakuLayerProps {
  width: number
  height: number
  currentTime: number
  videoId: string
  isLoggedIn: boolean
  onSend?: (text: string, mode: DanmakuMode, color: string, fontSize: DanmakuFontSize) => void
}

export default function DanmakuLayer({
  width,
  height,
  currentTime,
  videoId,
  isLoggedIn,
  onSend,
}: DanmakuLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  // Capture canvas ref when mounted — refs don't trigger re-renders,
  // so we use a state variable to feed the engine.
  useEffect(() => {
    setCanvas(canvasRef.current)
  }, [])

  const settings = useDanmakuStore((s) => s.settings)
  const toggleEnabled = useDanmakuStore((s) => s.toggleEnabled)
  const updateSettings = useDanmakuStore((s) => s.updateSettings)

  const [inputText, setInputText] = useState('')
  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [selectedMode, setSelectedMode] = useState<DanmakuMode>('scroll')
  const [selectedSize, setSelectedSize] = useState<DanmakuFontSize>('md')
  const [showSettings, setShowSettings] = useState(false)
  const [showInput, setShowInput] = useState(false)

  // run canvas engine
  useDanmakuEngine({
    canvas,
    width,
    height,
    currentTime,
    videoId,
  })

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    onSend?.(text, selectedMode, selectedColor, selectedSize)
    setInputText('')
  }

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex: 10,
  }

  return (
    <>
      {/* Canvas layer */}
      <canvas ref={canvasRef} style={canvasStyle} />

      {/* Danmaku input bar — bottom of player */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{ height: 64 }}
      >
        {/* Send input (toggle) */}
        {showInput && (
          <div
            className="absolute bottom-[52px] left-0 right-0 flex items-center gap-2 px-3 pointer-events-auto"
          >
            {/* mode buttons */}
            <div className="flex gap-0.5 bg-black/60 rounded overflow-hidden">
              {(['scroll', 'top', 'bottom'] as DanmakuMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'px-2 py-1 text-xs transition-colors',
                    selectedMode === mode
                      ? 'bg-[#FB7299] text-white'
                      : 'text-white/70 hover:text-white',
                  )}
                >
                  {mode === 'scroll' ? '滚动' : mode === 'top' ? '顶部' : '底部'}
                </button>
              ))}
            </div>

            {/* color swatches */}
            <div className="flex gap-1 bg-black/60 rounded px-1.5 py-0.5">
              {DANMAKU_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'w-4 h-4 rounded-full border transition-transform',
                    selectedColor === c
                      ? 'border-white scale-125'
                      : 'border-white/30',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* font size */}
            <div className="flex gap-0.5 bg-black/60 rounded overflow-hidden">
              {(['sm', 'md', 'lg'] as DanmakuFontSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    'px-2 py-1 text-xs transition-colors',
                    selectedSize === s
                      ? 'bg-[#FB7299] text-white'
                      : 'text-white/70 hover:text-white',
                  )}
                >
                  {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                </button>
              ))}
            </div>

            {/* text input + send */}
            <div className="flex-1 flex items-center bg-black/60 rounded-full overflow-hidden">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isLoggedIn ? '发一条弹幕吧~' : '请先登录'}
                disabled={!isLoggedIn}
                maxLength={100}
                className="flex-1 bg-transparent text-white text-sm px-3 py-1.5 placeholder:text-white/40 outline-none disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!isLoggedIn || !inputText.trim()}
                className="px-3 text-white/70 hover:text-[#FB7299] transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* bottom toolbar (always visible) */}
        <div className="absolute bottom-[52px] right-3 flex items-center gap-1 pointer-events-auto">
          {/* danmaku toggle */}
          <button
            onClick={toggleEnabled}
            className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-white/80 text-xs hover:bg-black/70 transition-colors"
          >
            {settings.enabled ? (
              <Eye className="w-3.5 h-3.5 text-[#FB7299]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            弹幕
          </button>

          {/* settings toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-white/80 text-xs hover:bg-black/70 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              设置
            </button>

            {showSettings && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg p-3 w-56 z-40 shadow-xl">
                  {/* opacity */}
                  <div className="mb-3">
                    <label className="text-white/70 text-xs block mb-1">
                      透明度: {Math.round(settings.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={settings.opacity}
                      onChange={(e) =>
                        updateSettings({ opacity: Number(e.target.value) })
                      }
                      className="w-full h-1 accent-[#FB7299] cursor-pointer"
                    />
                  </div>

                  {/* display area */}
                  <div className="mb-3">
                    <label className="text-white/70 text-xs block mb-1">
                      显示区域
                    </label>
                    <div className="flex gap-1">
                      {[0.25, 0.5, 1].map((area) => (
                        <button
                          key={area}
                          onClick={() => updateSettings({ displayArea: area })}
                          className={cn(
                            'flex-1 py-1 rounded text-xs transition-colors',
                            settings.displayArea === area
                              ? 'bg-[#FB7299] text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20',
                          )}
                        >
                          {area === 1 ? '全屏' : `${Math.round(area * 100)}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* speed */}
                  <div className="mb-3">
                    <label className="text-white/70 text-xs block mb-1">
                      弹幕速度: {settings.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={settings.speed}
                      onChange={(e) =>
                        updateSettings({ speed: Number(e.target.value) })
                      }
                      className="w-full h-1 accent-[#FB7299] cursor-pointer"
                    />
                  </div>

                  {/* block filters */}
                  <div>
                    <label className="text-white/70 text-xs block mb-1">
                      屏蔽设置
                    </label>
                    <div className="flex gap-2">
                      {([
                        ['blockScroll', '滚动'],
                        ['blockTop', '顶部'],
                        ['blockBottom', '底部'],
                      ] as const).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center gap-1 text-white/70 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={settings[key]}
                            onChange={(e) =>
                              updateSettings({ [key]: e.target.checked })
                            }
                            className="accent-[#FB7299]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* input toggle */}
          <button
            onClick={() => setShowInput(!showInput)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
              showInput
                ? 'bg-[#FB7299] text-white'
                : 'bg-black/50 text-white/80 hover:bg-black/70',
            )}
          >
            <Send className="w-3.5 h-3.5" />
            发送
          </button>
        </div>
      </div>
    </>
  )
}
