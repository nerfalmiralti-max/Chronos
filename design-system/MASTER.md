# Chronos Design System

Chronos is a calm, precise personal time companion. Each screen has one visual center and one primary action. The interface is native-first, typographic, spacious, and avoids dashboard density.

## Semantic colors

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| background | `#F5F4F1` | `#111113` | app canvas |
| surface | `#FFFFFF` | `#1A1A1D` | grouped surfaces |
| surface-secondary | `#ECEAE6` | `#232327` | inputs, quiet controls |
| text | `#17171A` | `#F7F7F8` | primary text |
| text-secondary | `#67666C` | `#A6A5AB` | descriptions |
| border | `#DEDDD9` | `#303035` | hairlines |
| accent | `#6C4DFF` | `#8B74FF` | primary action, selection |
| success | `#268A59` | `#53C88B` | completion |
| warning | `#B46916` | `#E3A24D` | warning |
| danger | `#C33D48` | `#FF727C` | error, destructive |
| info | `#3478C8` | `#62A8F5` | information |

Purple guides attention. Status colors appear only in small indicators, never as decorative large surfaces.

## Typography

Use the system font for native rendering and Dynamic Type. Scale: `12 / 14 / 16 / 18 / 22 / 28 / 36 / 56`. Use tabular numerals for time, percentages, and metrics. Default weights are regular, medium, and semibold; bold is reserved for the primary metric.

## Spacing and layout

- Base grid: 4 pt. Tokens: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`.
- Phone gutters: 20 pt. Tablet readable column: 640 pt maximum.
- Touch targets are at least 44 x 44 pt.
- One main visual center per screen. No sidebars, tables, or desktop dashboard grids.
- Cards are reserved for a goal, insight, active timer, or chart. Lists live directly on the background with separators.

## Shape and depth

Radius tokens: `4 / 8 / 12 / full`. Cards use 8 pt. Sheets may use 12 pt. Light mode uses one subtle shadow level; dark mode uses borders rather than glow.

## Motion

- Tap feedback: 100 ms opacity/scale.
- Standard transition: 220 ms ease-out.
- Sheet: 300 ms native spring.
- Progress: 700 ms ease-out.
- Reduce Motion removes transforms and progress interpolation.

## Components

- Primary button: filled accent, one per screen, 52 pt high.
- Secondary: neutral surface with a hairline border.
- Tertiary: text only with a 44 pt hit area.
- Destructive: danger text or fill only in a confirmation flow.
- Inputs: 52 pt, persistent label, inline error, correct keyboard and autofill metadata.
- Icons: Expo Symbols in one consistent outline/fill hierarchy.

## Accessibility checklist

- Primary text contrast is at least 4.5:1; controls and large text at least 3:1.
- Every icon-only action has an accessibility label.
- Color is never the only status signal.
- Reading order follows visual order.
- Test 320, 375, 430, and tablet widths; portrait and landscape.
- Test large text, VoiceOver semantics, reduced motion, dark mode, keyboard avoidance, and safe areas.
