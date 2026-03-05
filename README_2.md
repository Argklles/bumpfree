# BumpFree 新增功能插件文档

> **⚠️ AI 维护须知：每当有新的功能插件被添加、修改或删除时，必须同步更新本文档（README_2.md），保持与项目实际功能一致。**

---

## 1. 📌 待定事件系统 (Pending Events)

**功能开关**：`plugins/features.ts` → `FEATURES.PENDING_EVENTS`

允许 Room 成员在公共课表日历上创建、编辑、删除临时/待定事件。

### 涉及文件
| 类型 | 路径 | 说明 |
|------|------|------|
| 数据库 | `supabase/add/001_add_event.sql` | 创建 `room_events` 表及 RLS 策略 |
| 类型 | `plugins/pending-events/types.ts` → `RoomEvent` | 事件数据结构定义 |
| Server Actions | `plugins/pending-events/actions.ts` | CRUD：`createRoomEvent` / `updateRoomEvent` / `deleteRoomEvent` |
| UI 组件 | `plugins/pending-events/CreateEventDialog.tsx` | 新建/编辑/删除事件的弹窗表单 |
| 集成 | `components/calendar/RoomCalendar.tsx` | 日历渲染待定事件、拖拽/点击创建、跨天切片显示 |
| 数据加载 | `app/room/[roomId]/page.tsx` | 查询 `room_events` 并传入日历组件 |

### 核心能力
- **拖拽创建**：在日历时间格上拖拽选区即可快速创建事件，预填开始/结束时间
- **点击创建**：单击时间格自动创建 1 小时事件（23:00 后自动截尾防止跨天）
- **编辑/删除**：点击已有待定事件可打开编辑弹窗，支持修改和删除
- **跨天切片**：跨多天的事件自动拆分为每日独立块显示，点击任意一块编辑完整事件
- **时区安全**：`datetime-local` 输入的本地时间通过 `toLocalISOString()` 准确转换，不丢失时区偏移

---

## 2. ⚙️ 公共课表设置 (Room Settings)

允许用户在日历界面自定义显示效果和成员颜色。

### 涉及文件
| 类型 | 路径 | 说明 |
|------|------|------|
| UI 组件 | `plugins/room-settings/RoomSettingsDialog.tsx` | 设置弹窗（⚙️ 齿轮图标触发） |
| Server Actions | `plugins/room-settings/actions.ts` | `updateMemberColor` 修改成员代表色 |
| 数据库 | `supabase/migrations/004_room_members_update_policy.sql` | 为 `room_members` 添加 UPDATE RLS 策略 |
| 依赖 | `components/ui/slider.tsx` | shadcn Slider 组件（字体大小滑块） |

### 功能明细

#### 2.1 字体大小（本地）
- 滑块调节，范围 `0.5rem` ~ `1.2rem`
- 存储：`localStorage` → `room-font-size`

#### 2.2 字体颜色（本地）
- 4 个预设色 + 原生颜色选择器
- 存储：`localStorage` → `room-font-color`

#### 2.3 背景图片（本地）
- 支持上传 JPG / PNG / WebP（≤ 5MB）
- 以 12% 透明度铺满日历背景
- 存储：`localStorage` → `room-bg-image`（base64 DataURL）
- 支持预览和一键清除

#### 2.4 成员代表色（全局同步）
- 修改 `room_members.color` 字段，全局可见
- 权限：仅自己或 Room Admin 可修改
- 鉴权在 Server Action 和 RLS 策略双层保障

---

## 3. 📐 日历布局优化

### 3.1 10 小时视窗滚动
- 日历显示全天 24 小时（`min=00:00`, `max=23:59`）
- CSS `min-height: 240%` 确保可视区域恰好显示 10 小时
- 原生滚动条上下滑动查看完整时间线

### 3.2 智能滚动定位
- 页面加载后自动滚动到最早事件所在位置（`scrollToTime`）
- 默认定位到早晨 7 点

### 3.3 拖拽选区视觉指示
- 拖拽时显示水平基准线和矩形选区
- 亮色模式：深色指示线（`rgba(0,0,0,...)`)
- 暗色模式：浅色指示线（`rgba(255,255,255,...)`）

---

## 数据库迁移清单

| 文件 | 作用 | 状态 |
|------|------|------|
| `001_init.sql` | 基础表结构及 RLS 策略 | ✅ 已执行 |
| `002_fix_rls.sql` | 清理旧策略的重置脚本 | ✅ 已执行 |
| `003_fix_rooms_recursion.sql` | 修复 rooms 递归查询 | ✅ 已执行 |
| `004_room_members_update_policy.sql` | 添加 `room_members` UPDATE RLS | ⚠️ 需手动执行 |
| `add/001_add_event.sql` | 创建 `room_events` 表 | ⚠️ 需手动执行 |

---

## 模块添加与去除指南

### 🔌 如何去除模块

#### 去除「待定事件系统」
1. **关闭功能开关**（最快方式，保留代码）：
   ```ts
   // plugins/features.ts
   PENDING_EVENTS: false,  // 改为 false 即可完全禁用
   ```
2. **彻底删除**（清理所有代码）：
   - 删除整个目录：`plugins/pending-events/`
   - 删除 `app/room/[roomId]/page.tsx` 中查询 `room_events` 的代码块（搜索 `PENDING_EVENTS`）
   - 删除 `RoomCalendar.tsx` 中所有 `PENDING_EVENTS` 条件分支及 `pendingEvents` 相关逻辑
   - 数据库：`DROP TABLE IF EXISTS public.room_events CASCADE;`
   - 删除 `plugins/features.ts` 中的 `PENDING_EVENTS` 开关

#### 去除「公共课表设置」
1. 删除整个目录：`plugins/room-settings/`
2. 在 `RoomCalendar.tsx` 中：
   - 删除 `import { RoomSettingsDialog ... }` 导入
   - 删除 `fontSize` / `fontColor` / `bgImage` 三组 state 及其 `localStorage` 读写逻辑
   - 删除 `<RoomSettingsDialog ... />` 组件调用
   - 删除背景图片的 `<div>` overlay
   - 将 `eventStyleGetter` 和 `EventComponent` 中的 `fontColor` / `fontSize` 恢复为硬编码值（`"#fff"` / `"0.72rem"`）
3. 在 `app/room/[roomId]/page.tsx` 中删除 `currentUser` 和 `roomAdminId` 两个 prop
4. 在 `RoomCalendarProps` 中删除 `currentUser` 和 `roomAdminId`
5. 可选：`npx shadcn@latest remove slider`（如无其他地方使用）

#### 去除「背景图片」功能（仅去掉背景，保留其他设置）
1. 在 `plugins/room-settings/RoomSettingsDialog.tsx` 中删除「背景图片」整个 section（搜索 `Background Image`）
2. 在 `RoomCalendar.tsx` 中：
   - 删除 `bgImage` state 和 `handleBgImageChange` 函数
   - 删除 `useEffect` 中读取 `room-bg-image` 的行
   - 删除 `<div>` 背景图 overlay
   - 删除传给 `RoomSettingsDialog` 的 `currentBgImage` / `onBgImageChange` props

#### 去除「日历布局优化（10小时视窗）」
1. 在 `RoomCalendar.tsx` 的 `<style>` 中删除 `min-height: 240%` 相关 CSS 规则
2. 将 `min` / `max` prop 改回固定范围（如 `7:00` ~ `22:00`）
3. 删除 `defaultScrollHour` 的 `useMemo` 及 `scrollToTime` prop

---

### ➕ 如何添加新模块

添加新插件时请遵循以下流程：

1. **注册功能开关**（如果功能需要可选启停）：
   ```ts
   // plugins/features.ts
   export const FEATURES = {
       PENDING_EVENTS: true,
       YOUR_NEW_FEATURE: true,  // ← 添加新开关
   } as const;
   ```

2. **创建文件**（推荐目录结构）：
   - 数据库迁移 → `supabase/migrations/NNN_xxx.sql` 或 `supabase/add/NNN_xxx.sql`
   - 插件目录 → `plugins/your-feature/`
     - 类型定义 → `plugins/your-feature/types.ts`
     - Server Actions → `plugins/your-feature/actions.ts`
     - UI 组件 → `plugins/your-feature/YourComponent.tsx`

3. **集成入口**：
   - 如果是日历增强功能，在 `RoomCalendar.tsx` 中引入并用 `FEATURES.YOUR_NEW_FEATURE` 条件保护
   - 如果需要服务端数据，在 `app/room/[roomId]/page.tsx` 中查询并传入

4. **数据库 RLS**：
   - 新表务必启用 RLS（`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`）
   - 为 SELECT / INSERT / UPDATE / DELETE 分别创建对应策略
   - **特别注意**：不要忘记 UPDATE 策略（已踩过坑 ↑）

5. **更新本文档**：
   - 在对应位置添加新模块的说明、涉及文件表、核心能力
   - 更新「数据库迁移清单」表格
