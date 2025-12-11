# Robo v0.1 实施计划

> 基于技术预研，采用 **tldraw + React + TailwindCSS** 技术栈

## 总体目标

实现一个支持 AI 生图的无限画布 Web 应用，核心功能包括：

1. 无限画布交互
2. AI 生成图片
3. 图片二次编辑（放大、移除背景）

## 实施阶段

---

## Stage 1: 项目基础设施搭建

**Goal**: 完成项目初始化和开发环境配置

**Success Criteria**:

- ✅ 项目可以本地运行
- ✅ TailwindCSS 正常工作
- ✅ TypeScript 编译无错误
- ✅ 基础的 tldraw 画布能够显示

**Tasks**:

1. 初始化 Vite + React + TypeScript 项目
2. 配置 TailwindCSS
3. 安装并配置 tldraw 依赖
4. 创建基础项目结构
5. 配置 ESLint + Prettier
6. 创建基础的 App 组件

**Tests**:

- [x] `npm run dev` 成功启动开发服务器
- [x] 浏览器中能看到基础的 tldraw 画布
- [x] TailwindCSS 样式正常渲染
- [x] 无 TypeScript 类型错误

**Status**: ✅ Complete

---

## Stage 2: 无限画布核心功能

**Goal**: 实现完整的无限画布体验，包括平移、缩放、选择等基础交互

**Success Criteria**:

- ✅ 用户可以自由缩放和平移画布
- ✅ 可以在画布上创建和移动图片
- ✅ 图片选中状态清晰可见
- ✅ 基础的 UI 布局完成（工具栏、侧边栏）

**Tasks**:

1. 配置 tldraw 编辑器基础设置
2. 创建自定义 Image Shape
3. 实现图片拖拽上传功能
4. 设计并实现主界面布局
   - 顶部工具栏
   - 左侧工具面板
   - 右侧属性面板（可选）
5. 实现画布控制（缩放、平移、重置视图）
6. 添加基础的键盘快捷键

**Tests**:

- [x] 可以拖拽本地图片到画布
- [x] 图片可以被选中、移动、缩放、旋转
- [x] 画布缩放和平移流畅无卡顿
- [x] UI 响应式布局正常工作

**Status**: ✅ Complete

---

## Stage 3: AI 生图集成

**Goal**: 集成 AI 图片生成功能，支持文本生成图片

**Success Criteria**:

- ✅ 用户可以输入文本提示生成图片
- ✅ 生成的图片自动添加到画布
- ✅ 显示生成进度和状态
- ✅ 错误处理友好

**Tasks**:

1. 选择并集成 AI 图片生成 API（使用：ByteDance SeedDream 4.0 火山方舟）
2. 创建 AI 生图配置和 API 密钥管理
3. 实现 AI 生图 UI 组件
   - 提示词输入框
   - 参数控制（尺寸、数量等）
   - 生成按钮
4. 实现生成状态管理
   - Loading 状态
   - 进度显示
   - 错误提示
5. 将生成的图片自动放置到画布中心
6. 实现生成历史记录（可选）

**Tests**:

- [x] 输入提示词能成功生成图片
- [x] 生成中显示 Loading 状态
- [x] 生成失败显示明确的错误信息
- [x] 生成的图片正确放置在画布上
- [x] 可以连续生成多张图片

**Status**: ✅ Complete

---

## Stage 4: 图片二次编辑功能

**Goal**: 实现图片的放大和背景移除功能

**Success Criteria**:

- ✅ 选中图片后可以执行放大操作
- ✅ 选中图片后可以移除背景
- ✅ 编辑操作有清晰的进度反馈
- ✅ 编辑结果替换原图或创建新图层

**Tasks**:

1. 集成图片放大 API（建议：Replicate + Real-ESRGAN）
2. 集成背景移除 API（建议：remove.bg 或 RMBG-2.0）
3. 创建图片操作上下文菜单/工具栏,操作bar,选中时悬浮在选中图片的上方
4. 实现放大功能
   - 选择放大倍数（2x, 4x）
   - 调用 API 处理
   - 更新画布图片
5. 实现背景移除功能
   - 调用 API 处理
   - 支持透明背景
   - 更新画布图片
6. 添加操作历史（撤销/重做）
7. 实现编辑进度指示器

**Tests**:

- [x] 选中图片后能看到编辑选项（浮动工具栏）
- [x] 图片放大功能正常工作（2x/4x Real-ESRGAN）
- [x] 背景移除功能正常工作（remove.bg API）
- [x] 编辑过程显示进度
- [x] 编辑失败有错误提示
- [ ] 可以撤销编辑操作（tldraw 内置支持）

**Status**: ✅ Complete

---

## Stage 5: 优化和完善

**Goal**: 性能优化、用户体验提升、bug 修复

**Success Criteria**:

- ✅ 大量图片时性能稳定
- ✅ 所有核心功能流畅运行
- ✅ 无明显 bug
- ✅ 用户引导完善

**Tasks**:

1. 性能优化
   - 图片懒加载
   - Canvas 渲染优化
   - API 请求节流
2. 用户体验优化
   - 添加快捷键说明
   - 添加操作提示
   - 优化加载状态
3. 错误处理完善
   - 网络错误处理
   - API 限流处理
   - 优雅降级
4. 代码质量
   - 添加单元测试
   - 代码重构
   - 类型完善
5. 文档编写
   - README
   - API 配置说明
   - 开发文档

**Tests**:

- [ ] 加载 50+ 图片无性能问题
- [ ] 所有功能通过手动测试
- [ ] 代码覆盖率 > 60%
- [ ] 无 console 错误

**Status**: Not Started

---

## 技术细节

### 关键技术决策

1. **AI 图片生成**
   - 使用：ByteDance SeedDream 4.0（火山方舟）
   - OpenAI 兼容 API 格式
   - 支持中文提示词

2. **图片处理**
   - 放大：Real-ESRGAN via Replicate ($0.0025/次)
   - 去背景：remove.bg API（50次/月免费）

3. **状态管理**
   - tldraw 内置状态管理画布状态
   - Zustand 管理 AI 生成状态和应用全局状态

4. **API 密钥管理**
   - 开发：环境变量（.env.local）
   - 生产：后端代理（避免暴露密钥）

### 文件结构

```
robo/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── TldrawCanvas.tsx
│   │   │   └── CustomImageShape.tsx
│   │   ├── Toolbar/
│   │   │   ├── AIGeneratePanel.tsx
│   │   │   └── ImageEditPanel.tsx
│   │   └── UI/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── services/
│   │   ├── ai/
│   │   │   ├── imageGeneration.ts
│   │   │   ├── imageUpscale.ts
│   │   │   └── backgroundRemoval.ts
│   │   └── api/
│   │       └── client.ts
│   ├── stores/
│   │   └── useAIStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── canvas.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### API 配置示例

```bash
# .env.local
VITE_ARK_API_KEY=your_ark_api_key_here           # 火山方舟 SeedDream 4.0
VITE_REPLICATE_API_KEY=your_replicate_key_here   # Real-ESRGAN 图片放大
VITE_REMOVE_BG_API_KEY=your_remove_bg_key_here   # 背景移除
```

### 开发流程

1. **每个 Stage 独立开发**
   - 完成一个 Stage 后再进入下一个
   - 每个 Stage 结束时代码可运行

2. **持续测试**
   - 每完成一个功能立即测试
   - 保持代码可编译状态

3. **增量提交**
   - 小步提交，频繁 commit
   - 清晰的 commit message

---

## 风险和应对

### 技术风险

| 风险            | 影响 | 应对策略                       |
| --------------- | ---- | ------------------------------ |
| AI API 不稳定   | 高   | 支持多提供商切换，添加重试机制 |
| 图片处理性能差  | 中   | 使用 Web Worker，显示进度      |
| tldraw 学习曲线 | 低   | 参考官方文档和示例             |

### 成本风险

| 项目         | 预估成本/月 | 优化方案             |
| ------------ | ----------- | -------------------- |
| AI 生图 API  | $20-50      | 限制免费用户生成次数 |
| 图片处理 API | $10-20      | 缓存处理结果         |
| 托管费用     | $5-10       | 使用 Vercel 免费额度 |

---

## 时间估算（参考）

- Stage 1: 1-2 天
- Stage 2: 3-4 天
- Stage 3: 3-4 天
- Stage 4: 4-5 天
- Stage 5: 2-3 天

**总计**: 约 2-3 周（全职开发）

---

## 成功指标（v0.1）

1. **功能完整性**
   - ✅ 无限画布流畅运行
   - ✅ AI 生图成功率 > 95%
   - ✅ 图片编辑功能稳定

2. **性能指标**
   - ✅ 画布支持 50+ 图片不卡顿
   - ✅ AI 生图响应时间 < 30s
   - ✅ 图片处理响应时间 < 20s

3. **用户体验**
   - ✅ 核心流程无需说明即可理解
   - ✅ 无阻塞性 bug
   - ✅ 错误提示清晰友好

---

**下一步**: 开始 Stage 1 - 项目基础设施搭建
