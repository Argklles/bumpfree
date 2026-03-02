# BumpFree

**BumpFree** 是一个面向高校学生群体（班委、社团）的课程表聚合协作工具。其核心目标是零门槛快速找到多人共同空闲时间，方便组织会议、活动。

## 🌟 核心功能

- **一键导入课表**：支持通过 [WakeUp 课程表](https://wakeup.fun/) 的分享口令一键导入个人完整课表。
- **自定义课程**：支持手动添加、编辑、删除课程，灵活管理个人时间。
- **多学期管理**：可以为不同的学期（如“大二上”、“大二下”）保存不同的课表方案，并任意切换激活状态。
- **Room 协作空间**：
  - 创建私有的 Room 房间，邀请好友、同学加入。
  - **聚合日历视图**：以月视图、周视图直观展示 Room 内所有成员的空余与重叠时间。
  - **成员颜色区分**：在周视图中，每节课或繁忙时段会显示对应成员的专属颜色标签，清晰可见谁有空、谁在忙。
  - **单人过滤查看**：可以单独点击成员名称，只查看某个人的课表。
  - **公开访问**：可将 Room 设为公开，通过唯一的公开链接生成无需登录即可查看的只读日历页面。
- **角色与权限控制**：
  - **SuperAdmin**：全站第一个注册的用户自动成为超级管理员，可访问 `/admin` 后台，管理全站用户、修改配额及权限。
  - **User**：普通注册用户，拥有独立的个人课表空间和默认 3 个 Room 的创建额度。
  - Room 内部分为房主（Admin）和普通成员，房主可管理成员和生成邀请链接。

## 🛠 技术栈

- **框架**：[Next.js 15](https://nextjs.org/) (App Router)
- **语言**：[TypeScript](https://www.typescriptlang.org/)
- **样式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **组件库**：[shadcn/ui](https://ui.shadcn.com/) (构建于 Radix UI 之上)
- **日历组件**：[react-big-calendar](https://github.com/jquense/react-big-calendar) (配合 date-fns)
- **后端数据库与鉴权**：[Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **数据流**：React Server Components (RSC) & Server Actions 
- **零独立后端**：完全依托 Next.js API 和 Supabase 的 Serverless 架构

## 🚀 快速开始

### 1. 环境准备

确保你已安装 `Node.js` (推荐 v18+)。

```bash
git clone https://github.com/theLucius7/bumpfree.git
cd bumpfree
npm install
```

### 2. Supabase 数据库配置

本项目必须依赖 Supabase 作为 Backend-as-a-Service。

1. 在 [Supabase](https://supabase.com/) 创建一个新项目。
2. 进入项目的 **SQL Editor**。
3. 复制本项目根目录下的 [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql) 的全部内容。
4. 粘贴到 SQL Editor 中并执行。这将会自动：
   - 创建 `profiles`, `schedules`, `courses`, `rooms`, `room_members`, `invitations` 等 6 张数据表。
   - 配置 Row Level Security (RLS) 安全策略，确保数据隔离。
   - 创建自动触发器：当用户注册时自动同步到 `profiles` 表，且**第一个注册的用户自动成为 SuperAdmin**。

### 3. 本地环境变量配置

在项目根目录复制 `.env.example` 并重命名为 `.env.local`：

```bash
cp .env.example .env.local
```

填入你在 Supabase 获取的密钥（在 Project Settings -> API 中）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase项目anon_key
```

### 4. 启动本地开发服务

```bash
npm run dev
```

> **注意 (Windows 用户)**：如果在使用 Next.js 15 + Turbopack 时遇到网络或工作区解析问题导致 Tailwind 样式失效，可以通过 `npx next dev --no-turbopack` 使用传统 Webpack 模式启动。

打开 [http://localhost:3000](http://localhost:3000)，注册账号即可开始体验。

## 📦 部署指南 (Vercel)

本项目完美适配 Vercel：

1. 将代码 Push 到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 在 Environment Variables 配置中填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
4. 点击 Deploy 即可完成部署！

## 📄 数据库迁移与安全设计 (RLS)

BumpFree 使用了 Supabase 强大的 Row Level Security 进行数据隔离。详细的策略见 SQL 脚本：

- **课表隔离**：普通用户只能读写自己的课表，但同一个 Room 的成员可以通过 Security Definer 函数跨越 RLS 读取彼此激活的课表以渲染聚合日历。
- **递归阻断**：利用无状态关联子查询设计权限验证逻辑，完美避免了跨表查询（如 `rooms` 查询 `room_members`）时导致的 PostgreSQL 无限递归问题。
- **免密码公开页**：Room Admin 打开公开访问开关后，非注册访客可以直接通过 `/room/[id]` 链接以只读身份渲染日历，RLS 会主动放行读取权限。

## 🤝 贡献说明

欢迎提交 Issue 和 Pull Request，我们非常期待与你共同完善 BumpFree！
