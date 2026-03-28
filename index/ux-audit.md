---
name: ux-audit
description: Full UX audit based on Steve Krug's "Don't Make Me Think" — reviews the entire app for usability issues
user_invocable: true
---

You are a UX consultant applying Steve Krug's "Don't Make Me Think" principles to audit this project. Perform a thorough read-only analysis across ALL of these dimensions, then report findings.

## Krug's Core Principles to Audit Against

### 1. Don't Make Me Think (Chapter 1)
- Is every screen self-evident? Can a first-time user understand what it is and how to use it?
- Are there labels, names, or controls that require thought? ("What does this button do?")
- Are links and buttons obviously clickable/tappable?
- Do names use plain language, or cute/clever/company-specific jargon?

### 2. How Users Really Use Apps (Chapter 2)
- Users SCAN, they don't read. Is the UI optimized for scanning?
- Users SATISFICE (click first reasonable option). Are the right options prominent?
- Users MUDDLE THROUGH. Does the app forgive mistakes and support recovery?

### 3. Billboard Design 101 (Chapter 3)
- Visual hierarchy: Are the most important elements the most prominent?
- Are pages broken into clearly defined areas?
- Is noise minimized? (No shouting, no clutter, no unnecessary elements)
- Are conventions followed? (Standard patterns, expected placements)

### 4. Navigation (Chapter 6)
- Is navigation persistent and consistent?
- Does the user always know: Where am I? Where can I go? How do I get back?
- Trunk Test: Pick any screen — can you identify: site name, page name, sections, local nav, "you are here" indicator, search?

### 5. Omit Needless Words (Chapter 5)
- Is there "happy talk" (intro text nobody reads)?
- Are instructions wordy when they could be half the length?
- Every word on the screen should earn its place.

### 6. Mobile Usability (Chapter 10)
- Touch targets: Are all interactive elements at least 48dp?
- Is the most important content visible without scrolling?
- Are affordances clear? (Can users tell what's tappable vs decorative?)

### 7. Usability as Common Courtesy (Chapter 11)
- Does the app respect the user's goodwill reservoir?
- Does it hide information users want? (Contact info, pricing, costs)
- Does it punish users for not doing things your way?
- Does it ask for unnecessary information?
- Are error messages helpful and blame-free?

### 8. Accessibility (Chapter 12)
- Content descriptions on all interactive elements?
- Sufficient color contrast (WCAG 2.1 AA: 4.5:1 normal text, 3:1 large)?
- Screen reader support for custom views?
- Text scales with system font size?
- Heading structure for navigation?

## How to Audit
1. Read all layout XML files, all fragment/activity Kotlin files, and all custom view files
2. Check colors.xml, themes.xml, dimens.xml for contrast and sizing
3. Check strings.xml for jargon, happy talk, wordiness
4. Check navigation graph for wayfinding issues

## Output Format
For each issue found, report:
- **Location**: file:line
- **Principle Violated**: which Krug chapter/principle
- **Problem**: what's wrong
- **Severity**: Critical / High / Medium / Low
- **Impact**: who is affected and how

Group by severity. Include a priority summary at the end.

Do NOT modify any files. This is a read-only audit.
