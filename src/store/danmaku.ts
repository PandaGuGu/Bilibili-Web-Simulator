import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DanmakuMode = 'scroll' | 'top' | 'bottom'
export type DanmakuFontSize = 'sm' | 'md' | 'lg'

export interface DanmakuItem {
  id: string
  userId: string
  text: string
  time: number
  mode: DanmakuMode
  color: string
  fontSize: DanmakuFontSize
  sendTime: number
}

export interface DanmakuSettings {
  enabled: boolean
  opacity: number
  displayArea: number
  speed: number
  blockScroll: boolean
  blockTop: boolean
  blockBottom: boolean
}

interface DanmakuState {
  settings: DanmakuSettings
  danmakuList: Record<string, DanmakuItem[]>
  updateSettings: (s: Partial<DanmakuSettings>) => void
  toggleEnabled: () => void
  addDanmaku: (
    videoId: string,
    item: Omit<DanmakuItem, 'id' | 'sendTime'>,
  ) => void
  removeDanmaku: (videoId: string, danmakuId: string) => void
  ensureVideo: (videoId: string) => void
}

export const DANMAKU_COLORS = [
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#00BFFF',
  '#FFD700',
  '#FF69B4',
  '#FFA500',
  '#9B59B6',
]

const defaultSettings: DanmakuSettings = {
  enabled: true,
  opacity: 1,
  displayArea: 1,
  speed: 1,
  blockScroll: false,
  blockTop: false,
  blockBottom: false,
}

const defaultDanmaku: Record<string, DanmakuItem[]> = {
  '1': [
    { id: 'd1', userId: 'u01', text: '来了来了！', time: 1, mode: 'scroll', color: '#FFFFFF', fontSize: 'md', sendTime: Date.now() },
    { id: 'd2', userId: 'u02', text: '这个视频太真实了', time: 2, mode: 'scroll', color: '#00BFFF', fontSize: 'md', sendTime: Date.now() },
    { id: 'd3', userId: 'u03', text: '前方高能！', time: 3, mode: 'top', color: '#FF0000', fontSize: 'lg', sendTime: Date.now() },
    { id: 'd4', userId: 'u04', text: '确实是这样', time: 4, mode: 'scroll', color: '#FFFFFF', fontSize: 'sm', sendTime: Date.now() },
    { id: 'd5', userId: 'u05', text: '哈哈哈笑死', time: 5, mode: 'scroll', color: '#FFD700', fontSize: 'md', sendTime: Date.now() },
    { id: 'd6', userId: 'u06', text: '有同感', time: 6, mode: 'bottom', color: '#FFFFFF', fontSize: 'md', sendTime: Date.now() },
    { id: 'd7', userId: 'u07', text: '太对了！', time: 7, mode: 'scroll', color: '#FF69B4', fontSize: 'md', sendTime: Date.now() },
    { id: 'd8', userId: 'u08', text: '泪目了', time: 8, mode: 'scroll', color: '#FFFFFF', fontSize: 'md', sendTime: Date.now() },
    { id: 'd9', userId: 'u09', text: '良心UP主', time: 9, mode: 'scroll', color: '#00FF00', fontSize: 'sm', sendTime: Date.now() },
    { id: 'd10', userId: 'u10', text: '三连了', time: 9, mode: 'top', color: '#FFA500', fontSize: 'md', sendTime: Date.now() },
  ],
}

export const useDanmakuStore = create<DanmakuState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      danmakuList: defaultDanmaku,

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      toggleEnabled: () =>
        set((s) => ({ settings: { ...s.settings, enabled: !s.settings.enabled } })),

      addDanmaku: (videoId, item) =>
        set((s) => {
          const list = s.danmakuList[videoId] || []
          const newItem: DanmakuItem = {
            ...item,
            id: `d_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sendTime: Date.now(),
          }
          return {
            danmakuList: {
              ...s.danmakuList,
              [videoId]: [...list, newItem],
            },
          }
        }),

      removeDanmaku: (videoId, danmakuId) =>
        set((s) => {
          const list = (s.danmakuList[videoId] || []).filter(
            (d) => d.id !== danmakuId,
          )
          return { danmakuList: { ...s.danmakuList, [videoId]: list } }
        }),

      ensureVideo: (videoId) =>
        set((s) => {
          if (s.danmakuList[videoId]) return {}
          return { danmakuList: { ...s.danmakuList, [videoId]: [] } }
        }),
    }),
    { name: 'bilibili-danmaku' },
  ),
)
