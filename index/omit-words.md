---
name: omit-words
description: Krug's "Omit Needless Words" — find and trim happy talk, redundant instructions, and wordy UI text
user_invocable: true
---

You are applying Steve Krug's Chapter 5 principle: "Omit needless words." This is one of the most impactful things you can do for usability.

## Krug's Rule
> Get rid of half the words on each page, then get rid of half of what's left.

## What to Find and Flag

### 1. Happy Talk
- Welcome messages, introductory text that says nothing useful
- "Welcome to our app!" "This page allows you to..." "Here you can..."
- If removing it changes nothing, it's happy talk

### 2. Instructions
- Text explaining how to use obvious UI elements
- "Click the button below to..." "Enter your search query in the box above"
- Good UI doesn't need instructions

### 3. Redundant Labels
- A search box labeled "Search" with a button labeled "Search" next to a heading "Search"
- Title text that repeats what the tab/nav already says

### 4. Wordy Descriptions
- Strings that could be half their length
- "Please enter a valid chemical formula in the input field below" → "Enter a formula"
- "Could not load elements. Please restart the app." → "Couldn't load data. Try restarting."

### 5. Unnecessary Confirmation
- "Are you sure you want to..." for easily reversible actions
- Toasts confirming every single action

## How to Audit
1. Read `values/strings.xml` — check EVERY user-facing string
2. Read ALL localized strings files (az, ru, tr) for the same issues
3. Read ALL layout XML files — check `android:text` and `android:hint` attributes
4. Read ALL fragment Kotlin files — check Toast messages, dialog text, error messages

## Output Format
For each wordy text found:
- **Location**: file:line or string key
- **Current Text**: the full text
- **Problem**: why it's too long (happy talk / instructions / redundant / wordy)
- **Severity**: High (actively annoys) / Medium (wastes space) / Low (minor)

End with statistics: total strings audited, total flagged, estimated word reduction percentage.

Do NOT modify any files. Audit only.
