---
name: scan-test
description: Krug's Scanning Test — evaluate if pages are designed for scanning (not reading) with proper visual hierarchy
user_invocable: true
---

You are evaluating this app's visual hierarchy and scannability based on Steve Krug's Chapters 2-3 ("How we really use the Web" and "Billboard Design 101").

## Core Insight
Users don't read — they SCAN. Design for scanning, not reading.

## What to Evaluate

### 1. Visual Hierarchy (Chapter 3)
For each screen, check:
- **Prominence**: Are the most important elements the most visually prominent? (larger, bolder, more contrast, more whitespace)
- **Grouping**: Are related things visually grouped?
- **Nesting**: Does visual nesting show what's part of what?
- If everything looks equally important → FAIL (user has to scan slowly)

### 2. Clearly Defined Areas
- Can a user glance at the page and point to distinct areas? ("Navigation", "Content", "Actions")
- Are areas separated by whitespace, borders, or background color?
- Or is it one undifferentiated mass of content?

### 3. Clickable Affordance
- Can users instantly tell what's clickable vs decorative?
- Do buttons look like buttons? Do links look like links?
- Are there elements that LOOK clickable but aren't? Or ARE clickable but don't look it?

### 4. Noise Level
- **Shouting**: Is everything bold/bright/competing for attention?
- **Disorganization**: Does the layout feel random?
- **Clutter**: Are there elements that could be removed without losing value?
- Ads, banners, badges — do they overwhelm the actual content?

### 5. Conventions
- Does the app follow standard Android/Material Design conventions?
- Navigation in expected location?
- Standard icons used for standard actions?
- Any reinvented wheels that just cause confusion?

### 6. Text Formatting for Scanning
- Short paragraphs?
- Bulleted lists where appropriate?
- Key words highlighted/bolded?
- Headings that are actually useful (not vague like "Information")?

## How to Audit
1. Read ALL layout XML files — evaluate visual hierarchy
2. Read the custom Views — check if the visual weight matches importance
3. Read dimens.xml — check text size hierarchy
4. Read strings.xml — check heading quality

## Output Format
For each screen:
```
## [Screen Name]
- Visual Hierarchy: STRONG / ADEQUATE / WEAK — why
- Defined Areas: CLEAR / PARTIAL / UNCLEAR — why
- Click Affordance: OBVIOUS / PARTIAL / CONFUSING — why
- Noise Level: LOW / MODERATE / HIGH — why
- Conventions: FOLLOWED / MOSTLY / BROKEN — why
- Scan Score: X/10
```

End with an overall app scannability score and the top 5 improvements that would have the biggest impact.

Do NOT modify any files. Evaluate only.
