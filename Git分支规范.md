# Git 分支规范 — Bilibili 模拟站

## 分支架构

```
main ─────●────────●────────●──→ 稳定发布 (v4.0 → v4.1 → v4.2)
           \        \        \
dev ───────●────────●────●───→ 日常开发 ✅
                           \
                  feature/xxx ─→ 大功能分支
```

## 分支职责

| 分支 | 用途 | 谁操作 | 禁止 |
|------|------|--------|------|
| `main` | 稳定发布版 | 只通过 dev → main PR | ❌ 直接 commit |
| `dev` | 日常开发 | 所有日常提交 | ❌ 直接合并到 main |
| `feature/xxx` | 大功能独立开发 | 从 dev 分出 → merge 回 dev | ❌ 长期不合并 |

## 日常工作流

### 日常小改动（bug 修、小功能）
```bash
# 默认在 dev 分支
git checkout dev
git add .
git commit -m "描述改动"
git push origin dev
```

### 大功能（如全新模块）
```bash
# 1. 从 dev 新建功能分支
git checkout dev
git checkout -b feature/弹幕系统
# 2. 开发...
git add .
git commit -m "弹幕系统: xxx"
git push -u origin feature/弹幕系统
# 3. 完成后合并到 dev
git checkout dev
git merge feature/弹幕系统
git push origin dev
# 4. 删除功能分支（可选）
git branch -d feature/弹幕系统
```

### 稳定发布（版本打 tag）
```bash
# 在 GitHub 上从 dev 创建 Pull Request → main
# 或者本地：
git checkout main
git merge dev
git tag v4.3
git push origin main --tags
git checkout dev  # 切回 dev 继续开发
```

## 版本记录

| 版本 | 提交 | 分支 | 内容 |
|------|------|------|------|
| v4.0 | `8a319f1` | main | 目录重构 + 14个分区页 + API 容错 + README |
| v4.1 | `7378b12` | main | 视频网格作者名修正 + Sidebar children 修复 |
| v4.2 | `9a09091` | main | 全局搜索框修复 + 关注/取消关注 Toggle |
| dev | `9a09091` | dev | 当前开发分支（与 v4.2 同步起点） |

## 当前状态

- **当前工作分支**: `dev`
- **远程仓库**: `PandaGuGu/Bilibili-Web-Simulator`
- **GitHub**: https://github.com/PandaGuGu/Bilibili-Web-Simulator
