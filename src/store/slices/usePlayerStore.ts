import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WatchHistoryEntry {
  videoId: string
  progress: number
  lastWatched: number
}

interface PlayerState {
  volume: number
  muted: boolean
  playbackRate: number
  watchHistory: WatchHistoryEntry[]
  setVolume: (v: number) => void
  toggleMute: () => void
  setPlaybackRate: (r: number) => void
  updateProgress: (videoId: string, progress: number) => void
  getProgress: (videoId: string) => number
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      volume: 80,
      muted: false,
      playbackRate: 1,
      watchHistory: [],

      setVolume: (v) =>
        set({ volume: Math.max(0, Math.min(100, v)), muted: v === 0 }),

      toggleMute: () => set((s) => ({ muted: !s.muted })),

      setPlaybackRate: (r) => set({ playbackRate: r }),

      updateProgress: (videoId, progress) =>
        set((s) => {
          const idx = s.watchHistory.findIndex((e) => e.videoId === videoId)
          const entry: WatchHistoryEntry = {
            videoId,
            progress,
            lastWatched: Date.now(),
          }
          if (idx >= 0) {
            const updated = [...s.watchHistory]
            updated[idx] = entry
            return { watchHistory: updated }
          }
          return { watchHistory: [...s.watchHistory, entry] }
        }),

      getProgress: (videoId) => {
        const entry = get().watchHistory.find((e) => e.videoId === videoId)
        return entry?.progress ?? 0
      },
    }),
    { name: 'bilibili-player' },
  ),
)
