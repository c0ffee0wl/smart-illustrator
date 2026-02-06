# Cover Learning Analysis Prompt

This prompt is used by the `--learn-cover` feature to analyze cover images via Gemini Vision and extract design patterns.

---

You are a YouTube cover image analysis expert. Analyze this cover image and extract patterns valuable for future cover design.

Output in the following JSON format:

```json
{
  "composition": "Composition description (e.g., left person + right text, center focus, comparison layout, etc.)",
  "colorScheme": "Color scheme (e.g., dark background + orange accent, high-contrast warm-cool pairing, etc.)",
  "textUsage": "Text usage (e.g., no text, 3-5 large words, prominent numbers, etc.)",
  "emotion": "Conveyed emotion (e.g., curiosity, urgency, professionalism, shock, etc.)",
  "focusPoint": "Visual focal point (e.g., facial expression, product logo, comparison elements, etc.)",
  "patterns": ["Pattern worth learning 1", "Pattern worth learning 2", "..."],
  "avoidPatterns": ["If there are issues, list patterns to avoid"]
}
```

{{USER_NOTE}}

Output JSON only, no other content.

---

## Variable Reference

- `{{USER_NOTE}}`: If the user provides `--learn-note "note content"`, it will be replaced with `User note: note content`; otherwise this line is removed

## Output Format

- **Must be pure JSON**: No other text or explanations
- **Language**: All field values in English
- **patterns**: Extract 2-5 patterns worth learning
- **avoidPatterns**: If there are issues, list 1-3 patterns to avoid; otherwise leave as empty array

## Analysis Focus Areas

The AI will focus on:

1. **Composition**: Element layout, visual balance, reading path
2. **Color scheme**: Color pairing, contrast, emotional conveyance
3. **Text**: Quantity, size, position, readability
4. **Emotion**: The feeling the cover conveys (curiosity/shock/professional/warm, etc.)
5. **Focal point**: What the eye is drawn to first

## Customization Tips

To adjust the analysis focus, you can modify:

- **JSON fields**: Add or remove fields (must also update type definitions in `scripts/cover-learner.ts`)
- **Field descriptions**: Adjust the examples in parentheses to guide AI attention to different aspects
- **Output requirements**: Adjust pattern counts, language, etc.

Changes take effect on the next `--learn-cover` run.
