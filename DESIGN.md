# Design: Unit Converter

**Direction:** The carpenter's rule. A tool surface (Operate): standard controls, one signature move.

## Color
- Ink shell: `--ink-950 #0f0d09`, `--ink-900 #14120d`, `--ink-800 #1c1a13`, `--ink-700 #2b281d`
- Boxwood yellow `--box #f2c52e`: the working surface, active tab, selected row; ink text on it
- Text `#f3f1ea`, dim `#b9b4a2`, soft ink on yellow `#3b3205`; error `#ff8a78` on ink
- Strategy: committed. Yellow carries the converter panel (about a third of the screen); everything else is ink.

## Type
- Barlow Condensed 500-700 for numerals, headings, brand (tabular figures); Barlow 400-600 for UI text. 17px base.
- Result 3.4rem to 6.6rem; page title to 3.6rem.

## Components
- **Tabs:** top bar, one per category, filled yellow when active; scroll horizontally on phones.
- **Rule panel:** value input (ink field, yellow numerals), from/to selects, swap button, no-JS Convert button.
- **Answer:** big result with symbol and unit name, Copy result.
- **Scale (signature):** a ruler under the answer with a pin that slides to the result. Log decade (1 to 10 times a power of ten) for positive magnitudes, linear 100-wide window for temperature and non-positive values.
- **All-units table:** every unit for the entered value, target row tinted, click a unit to make it the target.

## Motion
Result number rises in on change (0.32s), pin slides (0.55s ease-out), swap button turns 180 degrees on hover. All off under `prefers-reduced-motion`.

## Behavior
Works without JS (POST renders result and table). With JS: live conversion, swap carries the answer across, shareable `?value=&from=&to=` URLs kept in sync via `history.replaceState`.

## Responsive
880px: single column, form stacks (value, from, swap, to), tabs scroll.
