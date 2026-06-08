const API_BASE = 'http://localhost:3001/api';

function getToken() {
  return sessionStorage.getItem('bilibili-token') || localStorage.getItem('bilibili-token') || '';
}

async function request(path: string, options: { method?: string; body?: any; skipAuth?: boolean } = {}) {
  const { method = 'GET', body, skipAuth } = options;
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) return { success: false, message: `HTTP ${res.status}` };
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password }, skipAuth: true }),
  register: (username, email, password) => request('/auth/register', { method: 'POST', body: { username, email, password }, skipAuth: true }),
  getMe: () => request('/auth/me'),

  // Videos
  getVideos: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/videos${qs ? '?' + qs : ''}`);
  },
  getVideo: (id) => request(`/videos/${id}`),
  reviewVideo: (id, status) => request(`/videos/${id}/review`, { method: 'PUT', body: { status } }),
  likeVideo: (id) => request(`/videos/${id}/like`, { method: 'POST' }),
  getLikeStatus: (id) => request(`/videos/${id}/like/status`),
  coinVideo: (id) => request(`/videos/${id}/coin`, { method: 'POST' }),
  getCoinStatus: (id) => request(`/videos/${id}/coin/status`),

  // Articles
  getArticles: () => request('/articles'),
  getArticle: (id) => request(`/articles/${id}`),
  reviewArticle: (id, status) => request(`/articles/${id}/review`, { method: 'PUT', body: { status } }),

  // Comments
  getComments: (contentType, contentId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/comments/${contentType}/${contentId}${qs ? '?' + qs : ''}`);
  },
  postComment: (data) => request('/comments', { method: 'POST', body: data }),
  likeComment: (id) => request(`/comments/${id}/like`, { method: 'POST' }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  // Danmaku
  getDanmaku: (videoId) => request(`/danmaku/${videoId}`),
  sendDanmaku: (data) => request('/danmaku', { method: 'POST', body: data }),

  // Contents (admin)
  getAllContents: () => request('/contents/all'),

  // Users (admin)
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/users${qs ? '?' + qs : ''}`);
  },
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  getUserStats: (username: string) => request(`/users/${username}/stats`, { skipAuth: true }),
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    const token = sessionStorage.getItem('bilibili-token') || localStorage.getItem('bilibili-token') || '';
    const res = await fetch('http://localhost:3001/api/users/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });
    return res.json();
  },

  // Favorites
  getFavorites: () => request('/favorites'),
  addFavorite: (data) => request('/favorites', { method: 'POST', body: data }),
  removeFavorite: (id) => request(`/favorites/${id}`, { method: 'DELETE' }),
  getFavoriteFolders: () => request('/favorites/folders'),
  checkFavorite: (videoId) => request(`/favorites/check/${videoId}`),
  getUserFavorites: (username: string) => request(`/favorites/user/${username}`, { skipAuth: true }),

  // History
  getHistory: () => request('/history'),
  recordHistory: (videoId, progress) => request('/history', { method: 'POST', body: { videoId, progress } }),

  // Live
  getLiveRooms: () => request('/live'),
  getLiveRoomsAll: () => request('/live/all'),

  // Search
  search: (params: { q: string; type?: string; sort?: string }) => {
    const qs = new URLSearchParams(params as Record<string,string>).toString();
    return request(`/search${qs ? '?' + qs : ''}`, { skipAuth: true });
  },

  // Messages
  getConversations: () => request('/messages/conversations'),
  getMessages: (otherUserId: number) => request(`/messages/${otherUserId}`),
  sendMessage: (receiverId: number, content: string) => request('/messages', { method: 'POST', body: { receiverId, content } }),
  getUnreadCount: () => request('/messages/unread/count'),
  markAllMessagesRead: () => request('/messages/read-all', { method: 'PUT' }),

  // Follows
  follow: (userId: number) => request(`/follows/${userId}`, { method: 'POST' }),
  unfollow: (userId: number) => request(`/follows/${userId}`, { method: 'DELETE' }),
  checkFollow: (userId: number) => request(`/follows/${userId}/status`),
  getFollowings: (userId: number, page = 1) => request(`/follows/${userId}/followings?page=${page}`),
  getFollowers: (userId: number, page = 1) => request(`/follows/${userId}/followers?page=${page}`),
  updateFollowGroup: (userId: number, groupName: string) => request(`/follows/${userId}/group`, { method: 'PUT', body: { groupName } }),

  // Super Admin - 数据管理
  adminOverview: () => request('/admin/overview'),
  adminUsers: () => request('/admin/users'),
  adminUpdateUser: (id: number, data: any) => request(`/admin/users/${id}`, { method: 'PUT', body: data }),
  adminVideos: () => request('/admin/videos'),
  adminUpdateVideo: (id: number, data: any) => request(`/admin/videos/${id}`, { method: 'PUT', body: data }),
  adminDeleteVideo: (id: number) => request(`/admin/videos/${id}`, { method: 'DELETE' }),
  adminArticles: () => request('/admin/articles'),
  adminUpdateArticle: (id: number, data: any) => request(`/admin/articles/${id}`, { method: 'PUT', body: data }),
  adminComments: () => request('/admin/comments'),
  adminDeleteComment: (id: number) => request(`/admin/comments/${id}`, { method: 'DELETE' }),
  adminFollows: () => request('/admin/follows'),
  adminLiveRooms: () => request('/admin/live-rooms'),
  adminMessages: () => request('/admin/messages'),
};
