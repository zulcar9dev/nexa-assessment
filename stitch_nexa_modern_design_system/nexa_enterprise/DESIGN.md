---
name: Nexa Enterprise
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#3130c0'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b4dd8'
  on-tertiary-container: '#d9d8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  surface-light: '#ffffff'
  canvas-light: '#f8fafc'
  surface-dark: '#2b2c40'
  canvas-dark: '#232333'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444'
  info: '#3b82f6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for a premium, enterprise-grade SaaS experience that balances mathematical precision with human-centric warmth. It moves away from "coding" aesthetics toward a sophisticated "Innovation & Trust" narrative.

The visual style is **Corporate Modern with a Soft Edge**, characterized by:
- **Depth through Layering:** Utilizing multi-staged shadows and tonal shifts rather than heavy borders to define hierarchy.
- **Subtle Glassmorphism:** Employing backdrop blurs on floating elements (modals, sticky headers) to maintain context and a sense of premium craft.
- **Generous Breathing Room:** High whitespace ratios within cards and layouts to reduce cognitive load during complex assessment tasks.
- **Refined Precision:** Crisp iconography and structured grids that communicate the reliability of the underlying assessment data.

## Colors

The palette centers on **Deep Indigo** for authority and **Electric Cyan** for interactive energy. 

- **Primary (Indigo):** Used for primary actions and brand anchoring.
- **Secondary (Cyan):** Used as a high-visibility accent for focus states, interactive highlights, and secondary progress indicators.
- **Neutrals:** A sophisticated range of "Slate" grays. Backgrounds use a very slight cool tint (`#f8fafc`) to feel cleaner than pure neutral gray.
- **Surface Strategy:** In light mode, surfaces are pure white with subtle borders. In dark mode, a deep "Midnight Slate" (`#2b2c40`) is used for containers to provide depth against the darker canvas.

## Typography

This system uses a dual-font approach to balance personality with utility. 

- **Plus Jakarta Sans** is used for headings and titles to provide a welcoming, modern, and high-end feel. Its slightly rounded geometric forms soften the enterprise nature of the product.
- **Inter** is used for all body text, data points, and UI labels. It provides maximum legibility for dense assessment forms and analytical tables.
- **Hierarchy:** Strict adherence to the `label-caps` style for section headers and table column titles helps organize complex data layouts without adding visual weight.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains at a fixed width (256px), while the main content area expands to a `max-width` of 1440px to ensure line lengths remain readable on ultra-wide monitors.

- **Grid:** A 12-column grid system is used for dashboard layouts. 
  - **Desktop:** 24px gutters.
  - **Tablet:** 16px gutters.
  - **Mobile:** Single column with 16px side margins.
- **Spacing Rhythm:** All spacing is derived from a 4px base unit. Component internal padding should favor "generous" settings (e.g., `p-6` for cards) to maintain the premium SaaS feel.
- **Reflow:** On mobile, the sidebar collapses into a slide-out drawer triggered by a persistent header hamburger menu.

## Elevation & Depth

Visual hierarchy is primarily driven by **Tonal Layering** and **Ambient Shadows**:

- **Level 0 (Canvas):** The base background (`canvas-light`).
- **Level 1 (Cards/Sidebar):** White surfaces with a very soft 1px border (`#e2e8f0`) and a `shadow-sm`.
- **Level 2 (Hover/Active):** When a card is hovered, it uses a layered indigo-tinted shadow: `0 10px 25px -5px rgba(79, 70, 229, 0.12)`.
- **Level 3 (Modals/Dropdowns):** Elevated surfaces using `backdrop-blur-md` and 90% opacity white/dark-slate, surrounded by a `shadow-xl`.

Avoid hard black shadows. All shadows should be tinted with the Primary Indigo color at very low opacities to keep the UI feeling "clean" and cohesive.

## Shapes

The shape language is consistently "Rounded" to evoke a user-friendly and modern personality.

- **Base Radius:** 0.5rem (8px) for small components like buttons and input fields.
- **Large Radius (rounded-lg):** 1rem (16px) for cards, containers, and modals.
- **Pill (rounded-full):** Used exclusively for status badges (chips) and the main navigation active indicators to create a distinct visual contrast against rectangular UI elements.

## Components

### Buttons
- **Primary:** Solid Indigo with white text. Hover state shifts to a deeper indigo and adds a subtle lift effect.
- **Secondary/Outline:** 1.5px Cyan border with Cyan text. On hover, fills with a light Cyan wash (15% opacity).
- **Ghost:** No border or background. Becomes light gray or light indigo on hover.

### Inputs & Forms
- **Style:** 8px rounded corners, 1px neutral border. 
- **Focus State:** 1px Indigo border with a 3px soft indigo outer glow (`rgba(79, 70, 229, 0.15)`).
- **Labels:** Positioned above the field in `label-sm` weight, using a slightly darker neutral for high contrast.

### Cards
- **Assessment Cards:** Feature a 4px top-border gradient (Indigo to Cyan). Includes a "Hover Lift" interaction where the card moves `-4px` on the Y-axis.

### Status Badges
- **Pill Shape:** Fully rounded. 
- **Success:** Emerald green text/background-tint with a 6px solid emerald dot.
- **Warning:** Amber text/background-tint with a subtle pulse animation on the indicator dot to draw attention.

### Sidebar
- **Active State:** A horizontal pill background in 10% Indigo opacity with a 4px vertical Indigo "indicator" on the far left edge.