# Application Design System & Color Palette

## 1. Selected 4-Color Palette

The application uses a refined, high-contrast, premium architectural dark aesthetic:

| Color | Hex | Role | Usage |
|---|---|---|---|
| **Deep Obsidian** | `#100F0F` | Canvas / Base Background | App background, main containers, viewport canvas, modal backdrop. |
| **Pine Teal / Deep Emerald** | `#0F3D3E` | Primary Accent / CTAs | Primary action buttons (`Publish`, `Save`, `Add`, `Create`), active tab highlights, active tool markers. Hover: `#155455`. |
| **Warm Sand / Muted Gold** | `#E2DCC8` | Secondary Accent / Highlights | Secondary labels, badges, icon accents, subtle borders (`#E2DCC8]/20`), active pill indicators. |
| **Soft Off-White** | `#F1F1F1` | Primary Typography / Elements | Titles, headings, active text, button text on dark surfaces. |

---

## 2. Geometry & Border Radius

Per the design preference:
- Corners are crisp and square (`rounded-[4px]`, `rounded-[2px]`, or `rounded-none`).
- No excessively rounded pill-shapes or `rounded-2xl`.

---

## 3. Component Implementation Matrix

- **Login / Auth:** Deep Obsidian `#100F0F` card, Pine Teal `#0F3D3E` submit button, Warm Sand `#E2DCC8` field labels & link highlights, Off-white `#F1F1F1` headers.
- **Top Bar & Navigation Rail:** Deep Obsidian `#100F0F` rail, Pine Teal active item with `#E2DCC8`/30 border, subtle hover states.
- **Editor & Toolbar:** Pine Teal `#0F3D3E` active tool highlights, Commit/Save buttons, Warm Sand `#E2DCC8` icon highlights and PDF download accents.
- **Dashboard & Product Management:** Dark slate cards (`#141414` / `#171616`), Pine Teal primary buttons, Warm Sand metric counters and SKU badges.
