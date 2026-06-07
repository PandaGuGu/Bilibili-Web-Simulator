import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LiveStatus = 'preview' | 'living' | 'ended'

export interface LiveRoom {
  id: number
  userId: number
  title: string
  coverUrl: string
  status: LiveStatus
  streamKey?: string
  pullUrl?: string
  startedAt?: string
  endedAt?: string
  maxViewerCount: number
  currentViewerCount: number
  likeCount: number
  duration: number
  isRecorded: boolean
  createdAt: string
}

export interface LiveConfig {
  id: number
  userId: number
  pushDomain: string
  playDomain: string
  appName: string
  defaultTranscoding: string
  updatedAt: string
}

interface LiveViewLog {
  id: number
  liveRoomId: number
  userId: number | null
  deviceId: string
  enterAt: string
  leaveAt?: string
  watchDuration: number
}

interface LiveState {
  liveRooms: LiveRoom[]
  liveConfigs: LiveConfig[]
  viewLogs: LiveViewLog[]
  addLiveRoom: (room: Omit<LiveRoom, 'id' | 'createdAt' | 'currentViewerCount' | 'likeCount' | 'maxViewerCount' | 'duration' | 'isRecorded'>) => void
  updateLiveRoom: (id: number, updates: Partial<LiveRoom>) => void
  deleteLiveRoom: (id: number) => void
  updateViewerCount: (id: number, count: number) => void
  setLiveConfig: (userId: number, config: Omit<LiveConfig, 'id' | 'updatedAt'>) => void
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set) => ({
      liveRooms: [
        {
          id: 1, userId: 6, title: '前端开发实战直播', coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop',
          status: 'living', streamKey: 'stream_key_abc123', pullUrl: 'https://live.example.com/live/stream1',
          startedAt: '2026-06-06T14:00:00', maxViewerCount: 2300, currentViewerCount: 1250,
          likeCount: 5400, duration: 3600, isRecorded: false, createdAt: '2026-06-06T10:00:00'
        },
        {
          id: 2, userId: 7, title: 'AI绘画创作过程分享', coverUrl: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=225&fit=crop',
          status: 'preview', streamKey: 'stream_key_def456', pullUrl: 'https://live.example.com/live/stream2',
          maxViewerCount: 0, currentViewerCount: 0, likeCount: 0, duration: 0,
          isRecorded: false, createdAt: '2026-06-06T12:00:00'
        },
        {
          id: 3, userId: 1, title: '游戏实况：黑神话悟空', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop',
          status: 'ended', streamKey: 'stream_key_ghi789', pullUrl: 'https://live.example.com/live/stream3',
          startedAt: '2026-06-05T20:00:00', endedAt: '2026-06-05T23:30:00',
          maxViewerCount: 8500, currentViewerCount: 0, likeCount: 23400,
          duration: 12600, isRecorded: true, createdAt: '2026-06-05T18:00:00'
        },
        {
          id: 4, userId: 4, title: 'Python后端开发教程', coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
          status: 'preview', maxViewerCount: 0, currentViewerCount: 0,
          likeCount: 0, duration: 0, isRecorded: false, createdAt: '2026-06-06T16:00:00'
        },
      ],
      liveConfigs: [],
      viewLogs: [],

      addLiveRoom: (room) =>
        set((s) => ({
          liveRooms: [...s.liveRooms, {
            ...room,
            id: s.liveRooms.length + 1,
            currentViewerCount: 0,
            likeCount: 0,
            maxViewerCount: 0,
            duration: 0,
            isRecorded: false,
            createdAt: new Date().toISOString(),
          }],
        })),

      updateLiveRoom: (id, updates) =>
        set((s) => ({
          liveRooms: s.liveRooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteLiveRoom: (id) =>
        set((s) => ({
          liveRooms: s.liveRooms.filter((r) => r.id !== id),
        })),

      updateViewerCount: (id, count) =>
        set((s) => ({
          liveRooms: s.liveRooms.map((r) =>
            r.id === id
              ? { ...r, currentViewerCount: count, maxViewerCount: Math.max(r.maxViewerCount, count) }
              : r
          ),
        })),

      setLiveConfig: (userId, config) =>
        set((s) => ({
          liveConfigs: [
            ...s.liveConfigs.filter((c) => c.userId !== userId),
            { ...config, id: s.liveConfigs.length + 1, userId, updatedAt: new Date().toISOString() },
          ],
        })),
    }),
    { name: 'bilibili-live' },
  ),
)
