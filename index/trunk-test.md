---
name: trunk-test
description: Krug's Trunk Test — evaluate every screen for wayfinding and navigation clarity
user_invocable: true
---

You are applying Steve Krug's "Trunk Test" from Chapter 6 of "Don't Make Me Think" to every screen in this app.

## The Trunk Test
Imagine being blindfolded, driven to a random page of the app, and having the blindfold removed. You should be able to answer these questions without hesitation:

1. **What app is this?** (App name / logo visible?)
2. **What screen am I on?** (Page title / clear heading?)
3. **What are the major sections?** (Navigation visible?)
4. **What are my options at this level?** (Local actions clear?)
5. **Where am I in the scheme of things?** ("You are here" indicator?)
6. **How can I search?** (Search accessible?)
7. **How do I go back?** (Back navigation obvious?)

## How to Test
1. Read the navigation graph (`nav_graph.xml`) to get ALL destinations
2. For each destination, read its layout XML
3. For each layout, evaluate the 7 questions above
4. Check the hosting activity (MainActivity) for bottom nav behavior
5. Check each fragment for toolbar/title setup

## Scoring
For each screen, score each question: PASS / PARTIAL / FAIL

## Output Format
```
## [Screen Name] (fragment_xyz.xml)
1. App identity: PASS/PARTIAL/FAIL — explanation
2. Page name: PASS/PARTIAL/FAIL — explanation
3. Major sections: PASS/PARTIAL/FAIL — explanation
4. Local options: PASS/PARTIAL/FAIL — explanation
5. You are here: PASS/PARTIAL/FAIL — explanation
6. Search access: PASS/PARTIAL/FAIL — explanation
7. Back navigation: PASS/PARTIAL/FAIL — explanation
Score: X/7
```

End with a summary table of all screens and their scores.

Do NOT modify any files. This is a read-only evaluation.
