# BumpFree Plus — 迁移说明

- **项目名称**：BumpFree Plus（包名 `bumpfree-plus`）
- **当前路径**：`D:\AAAppp\bumpfree-plus`
- **来源**：自 `C:\Users\20244\.cursor\worktrees\bumpfree\gjr` 迁移，并改名为「bumpfree plus」。

## 已做

1. 将工程复制到 `D:\AAAppp\bumpfree-plus`（已排除 `node_modules`、`.next`）。
2. `package.json` 的 `name` 改为 `bumpfree-plus`。
3. `app/layout.tsx` 的 `metadata.title` 改为「BumpFree Plus - 零门槛找共同空闲」。
4. 在新目录执行 `npm ci`，依赖已安装。

## 你需要做

1. **环境变量**  
   在项目根目录新建 `.env.local`，填入：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
   ```

   （若继续用原 Supabase 项目，从原工程或 Supabase 控制台复制即可。）

2. **本地运行**  
   ```bash
   cd D:\AAAppp\bumpfree-plus
   npm run dev
   ```

3. **构建与检查**  
   ```bash
   npm run build
   npm run lint -- .
   ```

原工程（gjr）未删除，可继续在那边开发或对比；BumpFree Plus 作为独立副本在 `D:\AAAppp\bumpfree-plus` 使用即可。
