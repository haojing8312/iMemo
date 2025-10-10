# API 配置指南

## 📝 配置文件位置

环境变量配置文件：`.env.local`（项目根目录）

## 🔧 配置参数

在 `.env.local` 文件中配置以下参数：

```bash
# Nano Banana API Base URL
NEXT_PUBLIC_NANO_BANANA_BASE_URL=https://your-api-base-url.com/v1

# Nano Banana API Key
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_api_key_here
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_NANO_BANANA_BASE_URL` | API 的基础 URL（不含具体端点） | `https://api.nanobanana.com/v1` |
| `NEXT_PUBLIC_NANO_BANANA_API_KEY` | 您的 API 密钥 | `sk-xxxxxxxxxxxxx` |

## 🚀 使用步骤

### 1. 编辑配置文件

打开 `.env.local` 文件，替换为您的真实 API 信息：

```bash
NEXT_PUBLIC_NANO_BANANA_BASE_URL=https://api.your-provider.com/v1
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_real_api_key_123456789
```

### 2. 重启开发服务器

修改环境变量后，必须重启服务才能生效：

```bash
# 关闭当前运行的服务 (Ctrl+C)
# 然后重新启动
pnpm tauri dev
```

### 3. 查看配置是否生效

启动后，在浏览器控制台中会看到：

```
[API Config] BASE_URL: https://api.your-provider.com/v1
[API Config] API_KEY: ***6789
```

## 🧪 测试 API 连接

应用启动后，尝试上传照片并生成图片。

控制台会显示详细的 API 调用信息：
- `[MultiStyleGenerator] Starting style: ...`
- `[MultiStyleGenerator] Prompt: ...`
- 如果 API 配置正确，将看到生成进度

## ⚠️ 注意事项

1. **不要提交 `.env.local` 到 Git**
   - 该文件已在 `.gitignore` 中
   - 避免泄露 API 密钥

2. **环境变量命名规则**
   - Next.js 中，暴露给前端的变量必须以 `NEXT_PUBLIC_` 开头

3. **API 请求格式**
   - 当前代码假设使用 Gemini API 格式
   - 如果您的 API 格式不同，需要修改 `src/lib/api.ts` 中的请求结构

## 🔍 故障排查

### API Key 未生效

**症状**：控制台显示 `[API Config] API_KEY: NOT SET`

**解决方法**：
1. 确认 `.env.local` 文件在项目根目录（与 `package.json` 同级）
2. 确认变量名为 `NEXT_PUBLIC_NANO_BANANA_API_KEY`
3. 重启开发服务器

### BASE_URL 未生效

**症状**：控制台显示的 BASE_URL 仍然是默认值

**解决方法**：
1. 确认变量名为 `NEXT_PUBLIC_NANO_BANANA_BASE_URL`
2. 重启开发服务器

### API 调用失败

**症状**：生成图片时报错

**可能原因**：
1. API Key 不正确
2. BASE_URL 格式错误（确保不包含尾部斜杠）
3. API 请求格式与您的提供商不匹配

**调试步骤**：
1. 打开浏览器开发者工具 → Network 标签
2. 查看 API 请求的详细信息
3. 检查请求 URL、Headers、Body 是否正确

## 📚 API 格式适配

如果您的 nano banana API 使用不同的请求格式，需要修改 `src/lib/api.ts`:

### 修改请求格式

找到 `generateSingleImage` 函数（第 65-112 行），修改请求体结构：

```typescript
const response = await apiClient.post(
  `/your-endpoint`,  // 修改端点
  {
    // 修改请求体结构以匹配您的 API
    image: imageBase64,
    prompt: prompt,
    // ... 其他参数
  }
)
```

### 修改响应解析

修改响应数据的提取逻辑以匹配您的 API 返回格式。

## 📞 支持

如果遇到问题，请检查：
1. API 文档 - 确认请求格式
2. 网络请求 - 使用开发者工具查看实际请求
3. 控制台日志 - 查看详细错误信息
