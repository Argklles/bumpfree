# BumpFree Plus 整站改版 — 修改总结 (change)

**工作区路径**：`D:\AAAppp\bumpfree-plus`（由 `C:\Users\20244\.cursor\worktrees\bumpfree\gjr` 迁移）

---

## 修改文件目录

以下路径均相对于项目根目录 `D:\AAAppp\bumpfree-plus`。

| 类型 | 路径 |
|------|------|
| 新增 | `CHANGE.md` |
| 修改 | `app/globals.css` |
| 修改 | `app/layout.tsx` |
| 修改 | `app/page.tsx` |
| 修改 | `app/auth/login/page.tsx` |
| 修改 | `app/auth/register/page.tsx` |
| 修改 | `app/auth/forgot-password/page.tsx` |
| 修改 | `app/auth/update-password/page.tsx` |
| 修改 | `app/dashboard/layout.tsx` |
| 修改 | `app/dashboard/page.tsx` |
| 修改 | `app/dashboard/profile/page.tsx` |
| 修改 | `app/dashboard/rooms/page.tsx` |
| 修改 | `app/dashboard/invitations/page.tsx` |
| 修改 | `app/room/[roomId]/page.tsx` |
| 修改 | `app/admin/layout.tsx` |
| 修改 | `app/admin/users/page.tsx` |
| 修改 | `app/admin/settings/page.tsx` |
| 新增 | `components/auth/AuthShell.tsx` |
| 新增 | `components/shared/AppNav.tsx` |
| 新增 | `components/shared/PageHeader.tsx` |
| 新增 | `components/shared/EmptyState.tsx` |
| 新增 | `components/shared/MetricCard.tsx` |
| 修改 | `components/ui/button.tsx` |
| 修改 | `components/ui/card.tsx` |
| 修改 | `components/ui/input.tsx` |
| 修改 | `components/ui/textarea.tsx` |
| 修改 | `components/ui/badge.tsx` |
| 修改 | `components/dashboard/RoomManageCard.tsx` |
| 修改 | `components/dashboard/InvitationCard.tsx` |
| 修改 | `components/dashboard/CreateRoomDialog.tsx` |
| 修改 | `components/dashboard/WakeUpImportPanel.tsx` |
| 修改 | `components/dashboard/SettingsClient.tsx` |
| 修改 | `components/calendar/RoomCalendar.tsx` |
| 修改 | `components/admin/AdminUsersClient.tsx` |
| 修改 | `components/motion/PageWrapper.tsx` |
| 修改 | `components/motion/FloatingHeroElements.tsx` |
| 新增 | `lib/navigation.ts` |
| 修改 | `lib/utils.ts` |
| 修改 | `lib/utils/calendar.ts` |
| 修改 | `lib/actions/auth.ts` |
| 修改 | `lib/actions/courses.ts` |
| 修改 | `lib/actions/rooms.ts` |
| 修改 | `lib/supabase/client.ts` |

---

## 一、修改内容概览

### 1. 构建与类型修复
- **`app/dashboard/page.tsx`**：用 `getRelationItem` 收窄 `room_members.room` 类型，消除 `mr.room as {...}` 导致的构建错误。
- **`lib/utils.ts`**：新增 `getRelationItem<T>()`、`RelationValue<T>`，统一处理 Supabase 关系字段「单条/数组」不稳定返回。
- **`app/room/[roomId]/page.tsx`**：成员数据用 batch 查询（schedules、courses 一次拉取），并用 `getRelationItem` 解析 profile，去掉 N+1 与多余 `as`。
- **`app/dashboard/invitations/page.tsx`**：邀请列表用 `getRelationItem` 规范化 `room` / `inviter`，再传给 `InvitationCard`。

### 2. 设计系统基线
- **`app/globals.css`**：统一 `:root` / `.dark` 颜色、`--radius`、新增 `--surface*`、body 背景与选中色、工具类 `.page-shell` / `.page-stack` / `.glass-panel` / `.soft-panel` / `.section-title` / `.section-description`。
- **`components/ui/*`**：Button / Card / Input / Textarea / Badge 的圆角、阴影、hover、尺寸与 focus 态统一。
- **共享组件**（新建）：PageHeader、EmptyState、MetricCard、AppNav；**`lib/navigation.ts`**：dashboard/admin 导航与 `isNavItemActive()`。

### 3. 认证与首页
- **`components/auth/AuthShell.tsx`**：登录/注册/找回密码/改密统一壳层。
- **`app/auth/*`**：全部改用 `AuthShell`，表单与错误/成功态一致。
- **`app/page.tsx`**：首页重做，去掉重动画，改为静态/轻量样式。

### 4. Dashboard、Room、Admin
- Dashboard 布局与各页用 `AppNav`、`PageHeader`、`MetricCard`、`EmptyState`；Room 页房间头与成员图例；Admin 用同一套壳层与 `getAuthenticatedUser`/`getCurrentUser`。

### 5. 性能与稳定性
- auth 用 `cache()`；courses 导入后唯一 active 课表、WakeUp 超时；rooms 搜索排除当前用户、防抖、复制 try/catch；supabase client 单例；PageWrapper 支持 `useReducedMotion`。

---

## 二、下一步建议

### 短期（必做）
1. **环境**：在 `D:\AAAppp\bumpfree-plus` 下新增 `.env.local`，配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
2. **回归**：注册 → 登录 → 导入课表 → 创建 Room → 邀请成员 → 查看 Room → 管理员改配额。
3. **README**：更新项目说明与目录结构。

### 中长期
- 数据层 DTO、Server Actions 校验、loading/error 态、E2E、无障碍与性能（见原 CHANGE 文档）。

---

## 三、如何继续

- 在 `D:\AAAppp\bumpfree-plus` 打开工程，配置 env 后执行 `npm run dev`。
- 每次改完执行：`npm run build`、`npm run lint -- .`。
