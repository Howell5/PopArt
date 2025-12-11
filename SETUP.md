# PopArt 设置指南

## 快速开始

### 1. 获取火山方舟 API Key

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark)
2. 使用字节跳动账号登录（或注册）
3. 进入 "API Key 管理"
4. 点击 "创建 API Key"
5. 复制生成的 API Key

**注意**:
- 需要先充值才能使用（最低充值金额请查看官网）
- SeedDream 4.0 按使用量计费
- 请勿将 API Key 提交到 Git
- 建议设置用量预警

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录运行
cp .env.example .env.local
```

然后编辑 `.env.local`，添加你的 API Key：

```bash
# .env.local
VITE_ARK_API_KEY=你的火山方舟API密钥
```

### 3. 启动项目

```bash
npm run dev
```

访问 http://localhost:3000

## 环境变量说明

### Vite 自动支持环境变量

- ✅ **不需要** 安装 `dotenv` 包
- ✅ Vite 会自动读取 `.env` 文件
- ✅ 只有以 `VITE_` 开头的变量才能在浏览器中使用

### 文件优先级

Vite 按以下优先级读取环境变量文件：

1. `.env.local` - 本地覆盖（**最高优先级**，Git 忽略）
2. `.env.development` - 开发环境
3. `.env.production` - 生产环境
4. `.env` - 所有环境

**推荐**: 使用 `.env.local` 存储敏感信息（API Keys）

### 在代码中使用

```typescript
// ✅ 正确 - Vite 方式
const apiKey = import.meta.env.VITE_ARK_API_KEY

// ❌ 错误 - Node.js 方式（在浏览器中不工作）
const apiKey = process.env.VITE_ARK_API_KEY
```

## 验证配置

### 检查环境变量是否加载

打开浏览器控制台，运行：

```javascript
console.log(import.meta.env.VITE_ARK_API_KEY)
```

应该输出你的 API Key（开发环境下）。

### 测试 AI 生图

1. 在左侧 Sidebar 找到 "AI Generate" 面板
2. 输入提示词，例如："一幅宁静的山水画，夕阳西下"
3. 点击 "Generate with SeedDream"
4. 等待几秒，图片会自动添加到画布

**提示**：SeedDream 4.0 支持中文提示词，效果更好！

## 常见问题

### Q: 为什么环境变量没有生效？

**A**: 检查以下几点：
1. 变量名是否以 `VITE_` 开头
2. `.env.local` 文件是否在项目根目录
3. 是否重启了开发服务器（修改 .env 后需要重启）

### Q: 生成图片失败怎么办？

**A**: 检查：
1. API Key 是否正确配置
2. 是否有网络连接
3. 是否超过了每日免费额度
4. 查看浏览器控制台的错误信息

### Q: SeedDream 4.0 的计费标准是什么？

**A**:
- 按生成图片数量计费
- 具体价格请查看 [火山方舟定价](https://www.volcengine.com/docs/82379/1925114)
- 建议先少量充值测试

## 部署

### 生产环境配置

**不要** 在前端暴露 API Key！生产环境应该：

1. **方案 A**: 使用后端代理
   ```
   前端 → 你的后端 → Google Gemini API
   ```

2. **方案 B**: 使用 Vercel/Netlify 环境变量
   - 在平台控制台配置环境变量
   - 变量会在构建时注入

3. **方案 C**: 使用 API Gateway
   - 添加请求限流
   - 添加用户认证
   - 隐藏真实 API Key

## 安全建议

- ✅ 将 `.env.local` 添加到 `.gitignore`（已完成）
- ✅ 不要在代码中硬编码 API Key
- ✅ 不要将 API Key 提交到 Git
- ✅ 生产环境使用后端代理
- ✅ 定期轮换 API Key
- ✅ 监控 API 使用情况

## 需要帮助？

- 📖 查看 [火山方舟官方文档](https://www.volcengine.com/docs/82379)
- 📖 [SeedDream 4.0 API 参考](https://www.volcengine.com/docs/82379/1541523)
- 🐛 提交 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-repo/discussions)
