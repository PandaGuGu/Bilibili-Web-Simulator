/**
 * B站风格视频链接生成器
 * 格式: /video/:id?from=xxx&pos=N&vid=xxx
 *
 * from   - 来源页面标识
 * pos    - 在列表/网格中的位置（0-based）
 * vid    - 匿名设备标识（localStorage 持久化，用于统计推荐）
 */

// 来源页面枚举
export type VideoSource =
  | 'homepage'
  | 'homepage_carousel'
  | 'homepage_grid'
  | 'homepage_feed'
  | 'search'
  | 'category'
  | 'related'
  | 'user_profile'
  | 'user_feed'
  | 'user_videos'
  | 'favorites'
  | 'history'
  | 'vip'
  | 'dashboard'
  | 'feed';

// 生成或获取匿名访问者ID（模拟B站 vd_source）
function getVisitorId(): string {
  const key = 'bilibili_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    // 生成一个类似 B站 vd_source 的随机标识
    id = 'vs_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * 生成带跟踪参数的视频链接
 * @param videoId   视频ID
 * @param source    来源页面
 * @param position  列表位置（可选，0-based）
 * @returns         完整的链接路径，如 /video/8?from=homepage_grid&pos=2&vid=vs_abc123
 */
export function videoLink(
  videoId: number | string,
  source: VideoSource,
  position?: number,
): string {
  const params = new URLSearchParams();
  params.set('from', source);
  if (position !== undefined) params.set('pos', String(position));
  params.set('vid', getVisitorId());
  return `/video/${videoId}?${params.toString()}`;
}
