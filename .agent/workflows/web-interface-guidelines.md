---
description: Web interface guidelines from Vercel for building high-quality UIs
---

# Web Interface Guidelines

Best practices for building web interfaces based on Vercel's guidelines.

## Focus States
- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Never `outline-none` without focus replacement
- Use `:focus-visible` over `:focus` (avoid focus ring on click)
- Group focus with `:focus-within` for compound controls

## Forms
- Inputs need `autocomplete` and meaningful `name`
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Never block paste
- Labels clickable (`htmlFor` or wrapping control)
- Submit button stays enabled until request starts; spinner during request
- Errors inline next to fields; focus first error on submit
- Placeholders end with `…` and show example pattern

## Animation
- Honor `prefers-reduced-motion`
- Animate `transform`/`opacity` only (compositor-friendly)
- Never `transition: all`—list properties explicitly
- Animations interruptible

## Typography
- `…` not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces for units: `10 MB`, `⌘ K`
- Loading states end with `…`: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` for number columns
- Use `text-wrap: balance` on headings

## Content Handling
- Text containers handle long content: `truncate`, `line-clamp-*`, or `break-words`
- Flex children need `min-w-0` to allow text truncation
- Handle empty states

## Images
- `<img>` needs explicit `width` and `height` (prevents CLS)
- Below-fold images: `loading="lazy"`
- Above-fold critical images: `priority` or `fetchpriority="high"`

## Performance
- Large lists (>50 items): virtualize
- No layout reads in render
- Add `<link rel="preconnect">` for CDN/asset domains

## Navigation & State
- URL reflects state—filters, tabs, pagination in query params
- Links use `<a>` (Cmd/Ctrl+click support)
- Destructive actions need confirmation or undo window

## Touch & Interaction
- `touch-action: manipulation` (prevents double-tap zoom delay)
- `overscroll-behavior: contain` in modals/drawers

## Dark Mode & Theming
- `color-scheme: dark` on `<html>` for dark themes
- `<meta name="theme-color">` matches page background

## Content & Copy
- Active voice: "Install the CLI" not "The CLI will be installed"
- Title Case for headings/buttons
- Numerals for counts: "8 deployments" not "eight"
- Specific button labels: "Save API Key" not "Continue"
- Error messages include fix/next step

## Anti-patterns (avoid these)
- `user-scalable=no` disabling zoom
- `transition: all`
- `outline-none` without focus-visible replacement
- `<div>` with click handlers (should be `<button>`)
- Images without dimensions
- Form inputs without labels
- Icon buttons without `aria-label`
- Hardcoded date/number formats (use `Intl.*`)
