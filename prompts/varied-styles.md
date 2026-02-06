# Varied Mode Style Hints

When using the `--varied` parameter, two different style covers are generated for selection. The following are the two style hint texts, automatically appended to the prompt.

## Candidate 1: Dramatic & High-Contrast

**Style hint (Candidate 1)**: dramatic & high-contrast
- Use strong light-dark contrast
- Strong emotional tension
- Visual impact prioritized

## Candidate 2: Minimal & Professional

**Style hint (Candidate 2)**: minimal & professional
- Minimal composition, generous whitespace
- Professional, restrained, premium feel
- Information clarity prioritized

---

## Usage Notes

- **Auto-applied**: Automatically used when cover generation is detected (prompt contains cover/youtube/thumbnail) and `--varied` is enabled
- **Scope**: These hints are appended after the user's prompt
- **Relation to style**: These hints supplement `styles/style-dark.md`, they don't override core rules

## Customization Tips

You can modify the two style descriptions above to adjust generation results:

- **Style 1**: Best for conveying strong emotions, grabbing attention
- **Style 2**: Best for professional content, tutorial videos

Changes take effect on the next `--varied` generation.
