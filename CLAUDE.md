# BirHesab.az

Azerbaijan's online calculator platform — all calculations in one place.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4 with custom theme colors
- **Font**: Geist Sans (local woff)
- **Lang**: Azerbaijani (`az`) — all UI text in Azerbaijani

## Commands

- `npm run dev` — start dev server on port 3245
- `npm run build` — production build
- `npm run lint` — ESLint

## Project Structure

```
src/
  app/
    page.tsx              # Homepage — hero, search, category tabs, calculator grid
    layout.tsx            # Root layout with Header/Footer
    hesablayici/
      [slug]/page.tsx     # "Coming soon" fallback for unbuilt calculators
      emek-haqqi/page.tsx # Salary calculator (implemented)
      kredit/page.tsx     # Loan calculator (implemented)
      ipoteka/page.tsx    # Mortgage calculator (implemented)
      depozit/page.tsx    # Deposit calculator (implemented)
      valyuta/page.tsx    # Currency converter (implemented)
      edv/page.tsx        # VAT calculator (implemented)
      ielts/page.tsx      # IELTS score calculator (implemented)
      elave-is-saati/page.tsx # Overtime calculator (implemented)
  components/
    Header.tsx            # Site header/nav
    Footer.tsx            # Site footer
    SearchBar.tsx         # Calculator search input
    CategoryTabs.tsx      # Category filter tabs
    CalculatorCard.tsx    # Calculator listing card
    CalculatorLayout.tsx  # Shared layout for calculator pages (breadcrumbs, formula section, related calculators)
  data/
    calculators.ts        # Calculator registry — all calculator metadata, categories, types
```

## Key Patterns

- **Calculator registry**: All calculators are defined in `src/data/calculators.ts` with `Calculator` type. New calculators must be added there.
- **Routing**: Calculator pages live at `src/app/hesablayici/<slug>/page.tsx`. Unimplemented ones fall through to `[slug]/page.tsx` (coming soon).
- **Shared layout**: Use `CalculatorLayout` component for calculator pages — provides breadcrumbs, title, formula section, and related calculators.
- **Path alias**: `@/*` maps to `./src/*`
- **Client components**: Calculator pages with interactivity use `"use client"` directive.

## Theme Colors

Defined in `tailwind.config.ts`:
- `primary` / `primary-dark` / `primary-light` — blue (#2563eb)
- `accent` — amber (#f59e0b)
- `background` — slate (#f8fafc)
- `surface` — white
- `foreground` — dark slate (#0f172a)
- `muted` — gray (#64748b)
- `border` — light gray (#e2e8f0)

## Adding a New Calculator

1. Add entry to `src/data/calculators.ts` with id, name, description, category, icon, path
2. Create `src/app/hesablayici/<slug>/page.tsx`
3. Use `CalculatorLayout` wrapper with breadcrumbs, formula info, and related calculator IDs
4. Mark as `"use client"` if interactive
