# Prompts Directory

This directory centralizes all AI prompt templates for Smart Illustrator.

## Why Centralize?

- **Easy to modify**: Edit Markdown files directly, no code changes needed
- **Easy to iterate**: Compare different prompt versions and their effects
- **Easy to share**: Other users can customize prompts easily
- **Low barrier**: Non-technical users can adjust generation strategies

## Prompt File List

| File | Purpose | Called by |
|------|---------|----------|
| `varied-styles.md` | Two style hints for Varied mode (dramatic/minimal) | `scripts/generate-image.ts` |
| `learning-analysis.md` | AI prompt for cover learning analysis | `scripts/cover-learner.ts` |

## Where Are Other Prompts?

- **Style files**: `styles/style-light.md` and `styles/style-dark.md` define core design rules
- **Brand colors**: `styles/brand-colors.md` defines the color scheme
- **Cover learnings**: `~/.smart-illustrator/cover-learnings.md` (generated at runtime)

## How to Customize?

1. **Modify style hints**: Edit `varied-styles.md` to adjust the dramatic/minimal descriptions
2. **Modify learning analysis**: Edit `learning-analysis.md` to change what the AI focuses on when analyzing covers

Changes take effect immediately on the next generation, no restart needed.

## Notes

- Test generation results after modifying prompts
- Maintain correct JSON formatting (e.g., in `learning-analysis.md`)
- Do not delete required fields; you can adjust descriptions and instructions
