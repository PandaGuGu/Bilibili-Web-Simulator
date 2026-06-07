import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type Ref,
} from 'react'
import { usePlayerStore } from '@/store/player'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  PictureInPicture2,
} from 'lucide-react'
import { cn } from '@/common/utils/utils'

export interface BilibiliPlayerHandle {
  seekTo: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getVideoElement: () => HTMLVideoElement | null
}

interface BilibiliPlayerProps {
  src: string
  poster?: string
  className?: string
  onTimeUpdate?: (time: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0)
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const BilibiliPlayer = forwardRef<BilibiliPlayerHandle, BilibiliPlayerProps>(
  function BilibiliPlayer(
    { src, poster, className, onTimeUpdate, onPlay, onPause, onEnded },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>()
    const progressRef = useRef<HTMLDivElement>(null)

    const volume = usePlayerStore((s) => s.volume)
    const muted = usePlayerStore((s) => s.muted)
    const playbackRate = usePlayerStore((s) => s.playbackRate)
    const setVolume = usePlayerStore((s) => s.setVolume)
    const toggleMute = usePlayerStore((s) => s.toggleMute)
    const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate)

    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [showRateMenu, setShowRateMenu] = useState(false)
    const [hoverTime, setHoverTime] = useState<number | null>(null)
    const [hoverX, setHoverX] = useState(0)
    const [dragging, setDragging] = useState(false)

    /* ---------- imperative handle ---------- */
    useImperativeHandle(ref, () => ({
      seekTo: (t) => {
        if (videoRef.current) videoRef.current.currentTime = t
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      getDuration: () => videoRef.current?.duration ?? 0,
      getVideoElement: () => videoRef.current,
    }))

    /* ---------- sync volume / rate ---------- */
    useEffect(() => {
      if (!videoRef.current) return
      videoRef.current.volume = volume / 100
      videoRef.current.muted = muted
    }, [volume, muted])

    useEffect(() => {
      if (videoRef.current) videoRef.current.playbackRate = playbackRate
    }, [playbackRate])

    /* ---------- keyboard shortcuts ---------- */
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return
        const v = videoRef.current
        if (!v) return
        switch (e.key) {
          case ' ':
            e.preventDefault()
            if (v.paused) { v.play() } else { v.pause() }
            break
          case 'ArrowLeft':
            e.preventDefault()
            v.currentTime = Math.max(0, v.currentTime - 5)
            break
          case 'ArrowRight':
            e.preventDefault()
            v.currentTime = Math.min(v.duration || 0, v.currentTime + 5)
            break
          case 'ArrowUp':
            e.preventDefault()
            setVolume(Math.min(100, volume + 5))
            break
          case 'ArrowDown':
            e.preventDefault()
            setVolume(Math.max(0, volume - 5))
            break
          case 'f':
            toggleFullscreen()
            break
          case 'm':
            toggleMute()
            break
        }
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [volume])

    /* ---------- play / pause helpers ---------- */
    const togglePlay = useCallback(() => {
      const v = videoRef.current
      if (!v) return
      if (v.paused) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    }, [])

    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }, [])

    const togglePip = useCallback(async () => {
      const v = videoRef.current
      if (!v) return
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await v.requestPictureInPicture()
        }
      } catch {
        /* ignore unsupported */
      }
    }, [])

    /* ---------- progress seek ---------- */
    const seekFromEvent = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current
        const v = videoRef.current
        if (!bar || !v || !v.duration) return
        const rect = bar.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        v.currentTime = ratio * v.duration
      },
      [],
    )

    const handleProgressMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        setDragging(true)
        seekFromEvent(e)
      },
      [seekFromEvent],
    )

    useEffect(() => {
      if (!dragging) return
      const handleMove = (e: MouseEvent) => {
        const bar = progressRef.current
        const v = videoRef.current
        if (!bar || !v || !v.duration) return
        const rect = bar.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        v.currentTime = ratio * v.duration
      }
      const handleUp = () => setDragging(false)
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }, [dragging])

    /* ---------- hover tooltip ---------- */
    const handleProgressHover = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current
        const v = videoRef.current
        if (!bar || !v) return
        const rect = bar.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setHoverTime(ratio * (v.duration || 0))
        setHoverX(e.clientX - rect.left)
      },
      [],
    )

    /* ---------- auto-hide controls ---------- */
    const handleMouseMove = useCallback(() => {
      setShowControls(true)
      clearTimeout(controlsTimerRef.current)
      controlsTimerRef.current = setTimeout(() => {
        if (playing) setShowControls(false)
      }, 3000)
    }, [playing])

    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

    const progress =
      duration > 0 ? (currentTime / duration) * 100 : 0
    const bufferedPct =
      duration > 0 ? (buffered / duration) * 100 : 0

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black rounded-lg overflow-hidden aspect-video group select-none',
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
        onDoubleClick={toggleFullscreen}
      >
        {/* video element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) {
              const t = videoRef.current.currentTime
              setCurrentTime(t)
              onTimeUpdate?.(t)
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration)
              videoRef.current.volume = volume / 100
              videoRef.current.muted = muted
              videoRef.current.playbackRate = playbackRate
            }
          }}
          onProgress={() => {
            if (
              videoRef.current &&
              videoRef.current.buffered.length > 0
            ) {
              setBuffered(
                videoRef.current.buffered.end(
                  videoRef.current.buffered.length - 1,
                ),
              )
            }
          }}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPlay={() => {
            setPlaying(true)
            onPlay?.()
          }}
          onPause={() => {
            setPlaying(false)
            onPause?.()
          }}
          onEnded={() => {
            setPlaying(false)
            onEnded?.()
          }}
        />

        {/* loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-2 border-white/30 border-t-[#FB7299] rounded-full animate-spin" />
          </div>
        )}

        {/* center play button (paused) */}
        {!playing && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* controls overlay */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 transition-opacity duration-300',
            showControls || !playing ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-3 pt-10">
            {/* progress bar */}
            <div
              ref={progressRef}
              className="relative h-[6px] hover:h-[10px] bg-white/20 rounded-full cursor-pointer mb-3 group/bar transition-all"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* buffered */}
              <div
                className="absolute h-full bg-white/30 rounded-full transition-all"
                style={{ width: `${bufferedPct}%` }}
              />
              {/* played */}
              <div
                className="absolute h-full bg-[#FB7299] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* handle dot */}
              <div
                className="absolute top-1/2 w-[14px] h-[14px] bg-[#FB7299] rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg"
                style={{
                  left: `${progress}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              {/* hover tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-8 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none"
                  style={{ left: `${hoverX}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* control buttons row */}
            <div className="flex items-center justify-between text-white">
              {/* left */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="hover:text-[#FB7299] transition-colors"
                >
                  {playing ? (
                    <Pause className="w-5 h-5" fill="white" />
                  ) : (
                    <Play className="w-5 h-5" fill="white" />
                  )}
                </button>

                <span className="text-xs font-mono tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* volume */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    onClick={toggleMute}
                    className="hover:text-[#FB7299] transition-colors"
                  >
                    <VolumeIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value))
                      if (muted && Number(e.target.value) > 0) toggleMute()
                    }}
                    className="w-0 group-hover/vol:w-20 h-1 accent-[#FB7299] cursor-pointer transition-all overflow-hidden"
                  />
                </div>
              </div>

              {/* right */}
              <div className="flex items-center gap-3">
                {/* playback rate */}
                <div className="relative">
                  <button
                    onClick={() => setShowRateMenu(!showRateMenu)}
                    className="text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                  >
                    {playbackRate === 1 ? '倍速' : `${playbackRate}x`}
                  </button>
                  {showRateMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowRateMenu(false)}
                      />
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-1 min-w-[80px] z-20">
                        {PLAYBACK_RATES.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate)
                              setShowRateMenu(false)
                            }}
                            className={cn(
                              'block w-full text-left px-4 py-1.5 text-xs hover:bg-white/10 transition-colors',
                              playbackRate === rate && 'text-[#FB7299]',
                            )}
                          >
                            {rate}x{rate === 1 ? ' (默认)' : ''}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* PiP */}
                <button
                  onClick={togglePip}
                  className="hover:text-[#FB7299] transition-colors"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>

                {/* fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-[#FB7299] transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)
