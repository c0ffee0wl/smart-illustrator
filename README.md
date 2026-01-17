# Smart Illustrator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Experimental](https://img.shields.io/badge/Status-Experimental-orange.svg)](#status)

Intelligent article illustration Skill for Claude Code: analyze content, identify optimal image positions, generate Gemini prompts, and create professional infographics automatically.

## Status

> **Status: Experimental**
>
> - This is a public prototype that works for my demos, but does not yet cover all input scales and edge cases.
> - Output quality varies based on model version and input structure; results may fluctuate.
> - My primary focus is demonstrating how tools and systems work together, not maintaining this codebase.
> - If you encounter issues, please submit a reproducible case (input + output file + steps to reproduce).

## Features

- **Smart Position Detection**: Analyzes article structure to identify optimal illustration points
- **7 Illustration Types**: concept / process / comparison / data / scene / summary / metaphor
- **Dual Style System**: Light (content) + Dark tech (cover)
- **Cover Generation**: 16:9 landscape, no text, platform-ready
- **Brand Customizable**: Modify `references/` to apply your brand style
- **Gemini API Integration**: Auto-generate or copy prompts manually

## What Are Skills?

Skills are prompt-based extensions for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that give Claude specialized capabilities. Unlike MCP servers that require complex setup, skills are simple markdown files that Claude loads on demand.

## Installation

### Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- [Bun](https://bun.sh/) runtime (for image generation scripts)
- Gemini API Key (optional, for auto-generation)

### Option A: Manual Installation (Recommended)

```bash
# Clone to Claude Code Skills directory
git clone https://github.com/axtonliu/smart-illustrator.git ~/.claude/skills/smart-illustrator
```

### Option B: Copy Individual Files

```bash
# If you only want the skill without scripts
cp -r smart-illustrator/SKILL.md ~/.claude/skills/smart-illustrator/
cp -r smart-illustrator/references ~/.claude/skills/smart-illustrator/
```

## Usage

### Basic Usage

```bash
# Analyze article and generate illustrations (with cover)
/smart-illustrator path/to/article.md

# Without cover image
/smart-illustrator path/to/article.md --no-cover

# Specify number of illustrations
/smart-illustrator path/to/article.md --count 5
```

### Output Files

```
article.md                    # Original
article-image.md              # Article with illustrations (main output)
article-cover.png             # Cover image (16:9)
article-image-01.png          # Content illustration (3:4)
article-image-02.png
article-image-03.png
```

### Manual Gemini API Usage

```bash
# Set API Key
export GEMINI_API_KEY=your_key

# Single image
npx -y bun ~/.claude/skills/smart-illustrator/scripts/generate-image.ts \
  --prompt "A concept diagram showing..." \
  --output image.png

# Batch generation
npx -y bun ~/.claude/skills/smart-illustrator/scripts/batch-generate.ts \
  --config illustrations.json \
  --output-dir ./images
```

## Illustration Types

| Type | Best For | Composition |
|------|----------|-------------|
| `concept` | Abstract concepts, definitions | Center-radial |
| `process` | Steps, workflows | Horizontal/vertical nodes |
| `comparison` | A vs B, contrasts | Left-right split |
| `data` | Numbers, statistics | Chart-style |
| `scene` | Stories, scenarios | Narrative illustration |
| `summary` | Key points, summaries | Card grid |
| `metaphor` | Analogies, symbols | Creative visual |

## Style System

### Content Illustrations: Light Style

- 3:4 portrait format
- Light gray background `#F8F9FA`
- Flat geometric + thin lines
- See `references/style-light.md`

### Cover Images: Dark Tech Style

- 16:9 landscape format
- Deep blue gradient background
- Line icons + glassmorphism
- No text
- See `references/style-dark.md`

## File Structure

```
smart-illustrator/
├── SKILL.md                  # Skill definition (Claude Code entry)
├── README.md
├── LICENSE
├── scripts/
│   ├── generate-image.ts     # Single image generation
│   └── batch-generate.ts     # Batch image generation
└── references/
    ├── brand-colors.md       # Brand palette (customizable)
    ├── style-light.md        # Light style Gemini prompt
    └── style-dark.md         # Dark style Gemini prompt
```

## Customization

Want to use your own brand style?

### 1. Modify Brand Palette

Edit `references/brand-colors.md`:

```markdown
## Core / 核心色
| Your Brand Color | `#XXXXXX` | Your main color |

## Accent / 点缀色
| Your Accent | `#XXXXXX` | Your accent color |
```

### 2. Update Style Prompts

Sync color values in `references/style-light.md` and `references/style-dark.md`.

### 3. Done!

Your Skill now has your own brand identity.

## Cost

When using Gemini API for auto-generation:

| Model | Price | Quality |
|-------|-------|---------|
| `gemini-3-pro-image-preview` | $0.134/image ≈ ¥1/image | 2K (default) |

Get API Key: https://aistudio.google.com/apikey

## Contributing

Contributions welcome (low-maintenance project):

- Reproducible bug reports (input + output + steps + environment)
- Documentation improvements
- Small PRs (fixes/docs)

> **Note:** Feature requests may not be acted on due to limited maintenance capacity.

## Acknowledgments

This project builds upon these excellent tools:

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's AI coding assistant
- [Gemini API](https://ai.google.dev/) - Google's image generation API
- [Bun](https://bun.sh/) - Fast JavaScript runtime

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Author

**Axton Liu** - AI Educator & Creator

- Website: [axtonliu.ai](https://www.axtonliu.ai)
- YouTube: [@AxtonLiu](https://youtube.com/@AxtonLiu)
- Twitter/X: [@axtonliu](https://twitter.com/axtonliu)

### Learn More

- [Claude Skills 万字长文：从指令到资产的系统化构建指南](https://www.axtonliu.ai/newsletters/ai-2/posts/claude-agent-skills-maps-framework) - Complete methodology
- [AI Elite Weekly Newsletter](https://www.axtonliu.ai/newsletters/ai-2) - Weekly AI insights
- [Free AI Course](https://www.axtonliu.ai/axton-free-course) - Get started with AI

---

© AXTONLIU™ & AI 精英学院™ 版权所有
