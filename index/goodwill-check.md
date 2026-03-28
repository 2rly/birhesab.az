---
name: goodwill-check
description: Krug's Goodwill Reservoir check — find places where the app drains user trust and patience
user_invocable: true
---

You are auditing this app's "goodwill reservoir" based on Steve Krug's Chapter 11 ("Usability as Common Courtesy").

## The Goodwill Reservoir
Every user starts with a reservoir of goodwill toward your app. Each negative experience drains it. When it's empty, they leave (and leave a 1-star review). Things that FILL the reservoir are rare and precious. Things that DRAIN it are common and deadly.

## What DRAINS Goodwill (check for ALL of these)

### 1. Hiding Information Users Want
- Is pricing, contact info, or key data hidden behind extra taps?
- Are important features buried in settings?
- Does the user have to register/sign-in before seeing content?

### 2. Punishing Users for Not Doing Things Your Way
- Are error messages blaming? ("Invalid input" instead of helpful guidance)
- Does the app reject reasonable formats? (phone numbers, dates)
- Are raw exception messages shown to users?

### 3. Asking for Unnecessary Information
- Are there required fields that aren't actually needed?
- Does the app ask for permissions it doesn't need?

### 4. Being Deceptive or Manipulative
- Dark patterns: trick questions, disguised ads, forced continuity?
- Ad-free promises that don't fully deliver?
- Misleading button labels?

### 5. Putting Obstacles in the Way
- Unnecessary steps to complete common tasks
- Interstitial ads interrupting core workflows
- Forced waits when the user could proceed

### 6. Amateurish Design
- Sloppy layout, misaligned elements, inconsistent spacing
- Broken images, placeholder text, TODO comments visible
- Spelling/grammar errors

### 7. Not Recovering From Errors
- App crashes instead of showing error UI
- No retry mechanism for failed network requests
- Lost user input after errors

## What FILLS Goodwill (check if present)
- Telling users what they want to know (upfront, honest)
- Saving them steps wherever possible
- Put effort into design (shows you care)
- Know what questions users are likely to have, and answer them
- Provide graceful error recovery
- When in doubt, apologize

## How to Audit
1. Read ALL fragment Kotlin files — check error handling, user-facing messages
2. Read ALL layout XML files — check for hidden content, excessive steps
3. Read ad-related code — check for aggressive/deceptive patterns
4. Read strings.xml — check error messages for tone
5. Check manifest for unnecessary permissions

## Output Format
For each goodwill drain found:
- **Location**: file:line
- **Category**: which of the 7 drain types above
- **Problem**: what's happening
- **Severity**: Critical (users will uninstall) / High (1-star review) / Medium (frustration) / Low (mild annoyance)
- **Goodwill Impact**: estimate how much this drains per occurrence

End with a Goodwill Scorecard: rate the app 1-10 on each of the 7 categories.

Do NOT modify any files. Audit only.
