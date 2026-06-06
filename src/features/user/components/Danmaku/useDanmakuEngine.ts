import { useRef, useEffect, useCallback } from 'react'
import { useDanmakuStore, type DanmakuItem, type DanmakuFontSize } from '@/store/slices/useDanmakuStore'

export interface DanmakuEngineOptions {
  canvas: HTMLCanvasElement | null
  width: number
  height: number
  currentTime: number
  videoId: string
}

const FONT_SIZES: Record<DanmakuFontSize, number> = {
  sm: 16,
  md: 22,
  lg: 30,
}

const LINE_HEIGHT = 1.4
const CROSS_DURATION = 8 // seconds for a scroll danmaku to cross screen
const FIXED_DURATION = 4 // seconds a top/bottom danmaku stays

function getTrack(id: string, numTracks: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % numTracks
}

export function useDanmakuEngine({
  canvas,
  width,
  height,
  currentTime,
  videoId,
}: DanmakuEngineOptions) {
  const rafRef = useRef<number>(0)
  const settings = useDanmakuStore((s) => s.settings)
  const ensureVideo = useDanmakuStore((s) => s.ensureVideo)
  const danmakuList = useDanmakuStore((s) => s.danmakuList[videoId] || [])

  // Ensure video slot exists in store to avoid unstable `|| []` reference
  useEffect(() => {
    ensureVideo(videoId)
  }, [videoId, ensureVideo])

  const draw = useCallback(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.scale(dpr, dpr)
    }
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.clearRect(0, 0, width, height)

    if (!settings.enabled) return

    ctx.globalAlpha = settings.opacity

    const visibleArea = height * settings.displayArea
    const maxScrollTracks = Math.max(
      1,
      Math.floor(visibleArea / (FONT_SIZES.md * LINE_HEIGHT)),
    )
    const scrollSpeed = settings.speed * (width / CROSS_DURATION)
    const timeWindow = CROSS_DURATION + 2

    // ---------- scroll danmaku ----------
    if (!settings.blockScroll) {
      const scrollItems = danmakuList.filter(
        (d) =>
          d.mode === 'scroll' &&
          currentTime - d.time >= -0.5 &&
          currentTime - d.time <= timeWindow,
      )

      for (const d of scrollItems) {
        const fontSize = FONT_SIZES[d.fontSize] || FONT_SIZES.md
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
        const tw = ctx.measureText(d.text).width
        const elapsed = currentTime - d.time
        const x = width - elapsed * scrollSpeed
        if (x + tw < 0) continue
        const trackIdx = getTrack(d.id, maxScrollTracks)
        const y =
          fontSize + trackIdx * (fontSize * LINE_HEIGHT)

        if (y > visibleArea) continue

        ctx.strokeStyle = 'rgba(0,0,0,0.6)'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.strokeText(d.text, x, y)
        ctx.fillStyle = d.color
        ctx.fillText(d.text, x, y)
      }
    }

    // ---------- top fixed danmaku ----------
    if (!settings.blockTop) {
      let trackIdx = 0
      const topItems = danmakuList.filter(
        (d) =>
          d.mode === 'top' &&
          Math.abs(currentTime - d.time) < FIXED_DURATION,
      )
      for (const d of topItems) {
        const fontSize = FONT_SIZES[d.fontSize] || FONT_SIZES.md
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
        const tw = ctx.measureText(d.text).width
        const x = (width - tw) / 2
        const y = fontSize + trackIdx * (fontSize * LINE_HEIGHT)

        ctx.strokeStyle = 'rgba(0,0,0,0.6)'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.strokeText(d.text, x, y)
        ctx.fillStyle = d.color
        ctx.fillText(d.text, x, y)

        trackIdx++
      }
    }

    // ---------- bottom fixed danmaku ----------
    if (!settings.blockBottom) {
      let trackIdx = 0
      const bottomItems = danmakuList.filter(
        (d) =>
          d.mode === 'bottom' &&
          Math.abs(currentTime - d.time) < FIXED_DURATION,
      )
      for (const d of bottomItems) {
        const fontSize = FONT_SIZES[d.fontSize] || FONT_SIZES.md
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
        const tw = ctx.measureText(d.text).width
        const x = (width - tw) / 2
        const y = height - 40 - trackIdx * (fontSize * LINE_HEIGHT)

        ctx.strokeStyle = 'rgba(0,0,0,0.6)'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.strokeText(d.text, x, y)
        ctx.fillStyle = d.color
        ctx.fillText(d.text, x, y)

        trackIdx++
      }
    }

    ctx.globalAlpha = 1
  }, [canvas, width, height, currentTime, settings, danmakuList, videoId])

  // animation loop
  useEffect(() => {
    let active = true
    const loop = () => {
      if (!active) return
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw])
}
