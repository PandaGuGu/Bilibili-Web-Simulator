export function formatViews(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}
export function formatDuration(s: number): string {
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0')
}
export function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff/60000)
  if (mins<1) return '刚刚'
  if (mins<60) return mins+'分钟前'
  const hrs = Math.floor(mins/60)
  if (hrs<24) return hrs+'小时前'
  return String(Math.floor(hrs/24))+'天前'
}
