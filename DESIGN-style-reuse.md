# 风格复用功能设计

## 需求分析

用户痛点：
- 课程所有章节需要统一风格
- Newsletter 每期需要统一风格
- 不想每次都手动传 `--ref ref1.png --ref ref2.png --style dark`

## 设计方案

### 配置文件位置

优先级：**项目级 > 用户级 > 默认值**

| 位置 | 路径 | 用途 |
|------|------|------|
| 项目级 | `{工作目录}/.smart-illustrator/config.json` | 特定项目的风格配置（如某个课程） |
| 用户级 | `~/.smart-illustrator/config.json` | 用户全局默认风格 |

### 配置文件格式

```json
{
  "style": "light",
  "references": [
    "./refs/style-ref-01.png",
    "./refs/style-ref-02.png"
  ],
  "watermark": "© Axton | axtonliu.ai"
}
```

### 新增参数

| 参数 | 说明 |
|------|------|
| `--save-config` | 保存当前参数到配置文件（项目级） |
| `--save-config-global` | 保存到用户级配置 |
| `--no-config` | 临时禁用配置文件，只使用命令行参数 |

### 配置加载逻辑

```
1. 读取用户级配置（如果存在）
2. 读取项目级配置（如果存在，覆盖用户级）
3. 应用命令行参数（覆盖配置文件）
```

### 使用示例

```bash
# 首次配置：为课程设置风格
cd ~/my-course
/smart-illustrator article-01.md --style dark --ref ./refs/style-1.png --save-config

# 之后生成：自动使用配置
/smart-illustrator article-02.md  # 自动应用 dark 风格 + 参考图

# 临时覆盖：只改风格，保留参考图
/smart-illustrator article-03.md --style light

# 完全忽略配置
/smart-illustrator article-04.md --no-config --style minimal
```

## 实现步骤

1. **创建配置文件 schema** - 定义 `Config` 类型
2. **实现配置加载函数** - `loadConfig(cwd: string)`
3. **实现配置保存函数** - `saveConfig(config: Config, global: boolean)`
4. **修改 generate-image.ts** - 集成配置加载逻辑
5. **更新文档** - SKILL.md, README

## 关键设计决策

1. **参考图路径处理**：相对路径相对于配置文件所在目录
2. **保持简洁**：只保存必要配置（style, references, watermark）
3. **命令行优先**：配置文件是"默认值"，命令行参数永远优先

## 与 EXTEND.md 回滚的区别

EXTEND.md（已回滚）的问题：
- 包含 `constraints`、`forbidden` 等应该在 style 文件中的内容
- 过度设计，功能重叠

新方案的改进：
- 只保存"参数值"，不保存"规则"
- 规则仍然在 `styles/style-*.md` 中
- 配置文件 = 命令行参数的持久化版本
