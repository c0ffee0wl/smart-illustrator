# Smart Illustrator 开发文档

> 内部文档，用于开发和维护参考。不同步到 `~/.claude/skills/`。

## 一、完整功能清单

### 1.1 核心脚本

| 脚本 | 功能 | 状态 |
|------|------|------|
| `generate-image.ts` | 单张图片生成（Gemini/OpenRouter） | ✅ 完成 |
| `batch-generate.ts` | 批量图片生成（JSON 配置） | ✅ 完成 |
| `mermaid-export.ts` | Mermaid 图表导出为 PNG | ✅ 完成 |

### 1.2 两个正交维度

Smart Illustrator 有两个独立的维度，可以任意组合：

**维度 1：模式（Mode）** - 决定生成什么类型的图

| 模式 | 参数 | 说明 | 图片数量 |
|------|------|------|----------|
| **Article** | 默认 | 文章配图：封面 + Mermaid/信息图智能选择 | 少（3-5张） |
| **Slides** | `--mode slides` | 演示讲解：为 PPT/B-roll 设计的信息图 | 多（7-8张+） |
| **Cover** | `--mode cover` | 单独生成封面图 | 1张 |

**维度 2：输出方式（Output）** - 决定产出什么

| 输出方式 | 参数 | 说明 | 需要 API |
|----------|------|------|----------|
| **直接生成图片** | 默认 | 调用 Gemini API 生成图片 | ✅ 需要 |
| **输出 JSON Prompt** | `--prompt-only` | 输出 JSON，复制到 Gemini Web | ❌ 不需要 |

**组合矩阵：**

| 模式 | 输出方式 | 命令示例 |
|------|----------|----------|
| Article + 直接生成 | `/smart-illustrator article.md` |
| Article + Prompt | `/smart-illustrator article.md --prompt-only` |
| Slides + 直接生成 | `/smart-illustrator script.md --mode slides` |
| Slides + Prompt | `/smart-illustrator script.md --mode slides --prompt-only` |

**关键原则**：`--prompt-only` 是全局选项，适用于所有模式。用户是否使用 API 与选择什么模式无关。

### 1.3 高级功能

| 功能 | 参数 | 说明 | 状态 |
|------|------|------|------|
| 参考图 Style-lock | `--ref` | 使用参考图引导风格 | ✅ 完成 |
| Quality Router | `-c, --candidates` | 生成多张候选图 | ✅ 完成 |
| 双引擎系统 | 自动 | Mermaid/Gemini 智能选择 | ✅ 完成 |
| 断点续传 | 默认 | 跳过已存在的图片 | ✅ 完成 |
| 2K 分辨率 | `--size 2k` | 高分辨率输出 | ✅ 完成 |

---

## 二、参数完整列表

### 2.1 generate-image.ts

```bash
npx -y bun generate-image.ts [options]
```

| 参数 | 短写 | 默认值 | 说明 |
|------|------|--------|------|
| `--prompt` | `-p` | - | 图片描述文本 |
| `--prompt-file` | `-f` | - | 从文件读取 prompt |
| `--output` | `-o` | `generated.png` | 输出路径 |
| `--model` | `-m` | 自动 | 模型名称 |
| `--provider` | - | 自动 | `openrouter` 或 `gemini` |
| `--size` | - | `default` | `default` 或 `2k` |
| `--ref` | `-r` | - | 参考图路径（可多次使用） |
| `--ref-weight` | - | `1.0` | 参考图权重（暂未实现） |
| `--candidates` | `-c` | `1` | 生成候选图数量（1-4） |

**API 优先级**：
1. 有 `--ref` 参数 → 强制使用 Gemini（OpenRouter 不支持多模态）
2. 有 `OPENROUTER_API_KEY` → 使用 OpenRouter
3. 有 `GEMINI_API_KEY` → 使用 Gemini

**输出文件命名**：
- 单候选：`output.png`
- 多候选：`output-1.png`, `output-2.png`, ...

### 2.2 batch-generate.ts

```bash
npx -y bun batch-generate.ts [options]
```

| 参数 | 短写 | 默认值 | 说明 |
|------|------|--------|------|
| `--config` | `-c` | - | JSON 配置文件路径（必需） |
| `--output-dir` | `-o` | `./illustrations` | 输出目录 |
| `--model` | `-m` | `gemini-3-pro-image-preview` | 模型名称 |
| `--delay` | `-d` | `2000` | 请求间隔（毫秒） |
| `--prefix` | `-p` | 从文件名提取 | 文件名前缀 |
| `--regenerate` | `-r` | - | 重新生成指定 ID（如 "3" 或 "3,5,7"） |
| `--force` | `-f` | `false` | 强制重新生成所有图片 |

**JSON 格式支持**：
1. **统一格式**（推荐）：`pictures[]` 数组 + `style` 字符串
2. **Legacy 格式**：`illustrations[]` 数组（向后兼容）

### 2.3 mermaid-export.ts

```bash
npx -y bun mermaid-export.ts [options]
```

| 参数 | 短写 | 默认值 | 说明 |
|------|------|--------|------|
| `--input` | `-i` | - | 输入 .mmd 文件路径 |
| `--content` | `-c` | - | Mermaid 图表内容（内联） |
| `--output` | `-o` | `output.png` | 输出路径 |
| `--theme` | `-t` | `light` | 主题：`light` 或 `dark` |
| `--width` | `-w` | - | 图片宽度（像素） |
| `--height` | `-H` | - | 图片高度（像素） |

---

## 三、代码架构

```
smart-illustrator/
├── scripts/
│   ├── generate-image.ts     # 单张图片生成
│   │   ├── generateImageOpenRouter()  # OpenRouter API 调用
│   │   ├── generateImageGemini()      # Gemini API 调用
│   │   └── loadReferenceImages()      # 参考图加载
│   │
│   ├── batch-generate.ts     # 批量图片生成
│   │   ├── isUnifiedConfig()          # 格式检测
│   │   ├── buildPromptFromUnified()   # 统一格式处理
│   │   └── buildPromptFromLegacy()    # Legacy 格式处理
│   │
│   └── mermaid-export.ts     # Mermaid 导出
│       ├── checkMermaidCli()          # CLI 检查
│       └── exportMermaid()            # 导出执行
│
├── styles/
│   ├── brand-colors.md       # 品牌色板
│   ├── style-light.md        # 浅色风格（3:4 竖版）
│   ├── style-dark.md         # 深色风格（16:9 横版）
│   ├── style-minimal.md      # 极简风格
│   └── style-cover.md        # 封面图风格
│
├── references/
│   ├── slides-prompt-example.json  # PPT JSON 格式示例
│   └── cover-best-practices.md     # 封面图最佳实践
│
├── SKILL.md                  # Claude Code Skill 定义
├── CLAUDE.md                 # 项目开发规则
├── README.md                 # 英文文档
├── README.zh-CN.md           # 中文文档
└── DEVELOPMENT.md            # 本文档
```

---

## 四、API 调用说明

### 4.1 Gemini API

**端点**：
```
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
```

**请求体结构**（带参考图）：
```json
{
  "contents": [
    {
      "parts": [
        { "text": "Use the following images as style references..." },
        { "inlineData": { "mimeType": "image/png", "data": "base64..." } },
        { "text": "---\nNow generate a new image..." },
        { "text": "Generate an image: {prompt}" }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE", "TEXT"],
    "imageConfig": { "imageSize": "2K" }
  }
}
```

### 4.2 OpenRouter API

**端点**：
```
https://openrouter.ai/api/v1/chat/completions
```

**请求体结构**：
```json
{
  "model": "google/gemini-3-pro-image-preview",
  "messages": [{ "role": "user", "content": "{prompt}" }],
  "modalities": ["image", "text"],
  "image_config": { "image_size": "2K" }
}
```

**注意**：OpenRouter 不支持多模态输入（参考图），使用参考图时自动切换到 Gemini。

---

## 五、竞品对比分析

### 5.1 主要竞品：baoyu-skills

竞品仓库：https://github.com/JimLiu/baoyu-skills

相关 Skills：
- `baoyu-article-illustrator` - 文章配图
- `baoyu-infographic` - 信息图生成（20种布局 × 17种风格）
- `baoyu-slide-deck` - PPT 幻灯片生成
- `baoyu-cover-image` - 封面图生成
- `baoyu-xhs-images` - 小红书信息图

### 5.2 功能对比

| 功能维度 | Smart Illustrator | 竞品 |
|---------|-------------------|------|
| 布局类型 | ~10种 | 20种 |
| 视觉风格 | 4种预设 | 16-17种 |
| 双引擎系统 | ✅ Mermaid + Gemini | ❌ 仅 AI |
| 参考图 Style-lock | ✅ `--ref` | ❌ |
| Quality Router | ✅ `--candidates` | ❌ |
| PPTX/PDF 输出 | ❌ 仅 PNG | ✅ |
| `--outline-only` | ❌ | ✅ |
| Mermaid 嵌入 | ✅ 直接嵌入 MD | ❌ |

### 5.3 我们的差异化优势

1. **双引擎系统** - Mermaid 可编辑、版本控制友好
2. **参考图 Style-lock** - 系列图片风格一致
3. **Quality Router** - 多候选图提高质量

### 5.4 可借鉴的功能（Future）

1. 更多布局类型（20种 vs 10种）
2. 更多视觉风格预设
3. PPTX/PDF 直接输出
4. `--outline-only` 先看大纲再生成

---

## 六、设计决策历史

### 5.1 已实现功能

| 日期 | 功能 | 决策原因 |
|------|------|----------|
| 2026-01-28 | 参考图 Style-lock | 确保系列图片风格一致 |
| 2026-01-29 | Quality Router | 生成多候选图，提高质量 |

### 5.2 已回滚功能

| 日期 | 功能 | 回滚原因 |
|------|------|----------|
| 2026-01-30 | Match 模式（`--mode match`）| 测试成功率 < 1%，PPT 图片（完整知识点总结）与文章插图（过程示意/局部说明）设计目标根本不匹配 |
| 2026-01-29 | EXTEND.md 配置系统 | 过度设计，constraints/forbidden 应放在 style-*.md 中 |
| 2026-01-29 | `--style-lock` 参数 | 功能与 `--ref` 重叠，保持简洁 |
| 2026-01-29 | `--save-style` 参数 | EXTEND.md 回滚后不再需要 |

### 5.3 设计原则

1. **简洁优先**：能用现有机制就不新增配置
2. **风格配置统一在 style-*.md**：不分散到多个文件
3. **参考图使用 `--ref` 命令行参数**：简单直接，不需要持久化配置
4. **自定义风格通过创建 `style-xxx.md`**：扩展现有机制

---

## 六、测试覆盖

### 6.1 已测试场景

| 场景 | 测试日期 | 状态 |
|------|----------|------|
| 单张图片生成（Gemini） | 2026-01-28 | ✅ |
| 单张图片生成（OpenRouter） | 2026-01-28 | ✅ |
| 参考图 Style-lock | 2026-01-29 | ✅ |
| Quality Router（2 候选） | 2026-01-29 | ✅ |
| 批量生成（统一格式） | 2026-01-27 | ✅ |
| 批量生成断点续传 | 2026-01-27 | ✅ |
| Mermaid 导出 | 2026-01-26 | ✅ |

### 6.2 测试文件位置

- `test-output/` - 测试输出目录

---

## 七、待办事项

### 7.1 优先级：高

- [ ] 用户创建新参考图（轻盈字体风格）
- [ ] Preview + approval 工作流

### 7.2 优先级：中

- [ ] 响应式图片 / 多尺寸输出
- [ ] `--ref-weight` 参数实现

### 7.3 优先级：低（未来考虑）

- [ ] Vega-Lite 数据可视化支持
- [ ] 本地 Stable Diffusion 后端

---

## 八、Git 提交历史（近期）

```
02e35f1 refactor: Remove EXTEND.md/Style-lock, keep --ref and --candidates
ff9a0c1 feat: Add Style-lock and Quality Router features
```

**当前状态**：2 commits ahead of origin/main（未 push）

---

## 九、同步检查清单

修改后需同步到 `~/.claude/skills/smart-illustrator/`：

- [x] `scripts/generate-image.ts`
- [x] `scripts/batch-generate.ts`
- [x] `scripts/mermaid-export.ts`
- [x] `styles/*.md`
- [x] `references/*.md`
- [x] `references/*.json`
- [x] `SKILL.md`
- [ ] `DEVELOPMENT.md`（不需要同步）
- [ ] `test-output/`（不需要同步）

---

*最后更新：2026-01-30*
