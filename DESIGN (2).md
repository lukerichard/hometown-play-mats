---
name: Adventure Map System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cc'
  surface-tint: '#555f70'
  primary: '#212b3a'
  on-primary: '#ffffff'
  primary-container: '#374151'
  on-primary-container: '#a3adc0'
  inverse-primary: '#bdc7db'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed01b'
  on-secondary-container: '#6f5900'
  tertiary: '#003211'
  on-tertiary: '#ffffff'
  tertiary-container: '#004b1e'
  on-tertiary-container: '#22c55e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e3f7'
  primary-fixed-dim: '#bdc7db'
  on-primary-fixed: '#121c2a'
  on-primary-fixed-variant: '#3d4757'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is adventurous, imaginative, and dependable. It bridges the gap between high-end custom manufacturing and the joyous, uninhibited world of childhood play. The UI must evoke an emotional response of "structured fun"—it feels like a premium toolkit for world-building.

The design style is **Modern-Tactile**. It takes the clean, functional layouts of modern SaaS platforms (like Google Maps) and injects the physical, "clickable" energy of LEGO. High-quality whitespace ensures the vibrant product colors pop, while subtle depth effects make the interface feel like a physical mat waiting to be touched. Every interaction should feel child-safe and premium, avoiding the cluttered aesthetic of budget toy sites in favor of a sophisticated, modular design.

## Colors

The palette is rooted in the "Road Gray" primary, providing a professional and grounded foundation that mimics asphalt and structure. "Caution Yellow" is utilized for primary actions, drawing the eye like a road sign, while "Grass Green" serves as the secondary accent for nature-themed elements and positive feedback.

- **Road Gray (#374151):** Used for typography, iconography, and structural borders.
- **Caution Yellow (#FACC15):** Reserved for high-priority CTAs and interactive "hotspots" in the customizer.
- **Grass Green (#22C55E):** Used for success states, "Environment" selection, and secondary action buttons.
- **Map White (#F8FAFC):** The canvas color, providing a clean, slightly cool neutral that feels more premium than pure white.

## Typography

This design system uses **Quicksand** exclusively to maintain a friendly, approachable, and child-safe aesthetic. The rounded terminals of the glyphs mirror the safety of rounded toy corners. 

Headlines use heavy weights (Bold/700) to create a strong visual hierarchy and a "block-like" presence. Body copy remains medium (500) to ensure high legibility against vibrant backgrounds. For small labels and metadata, we use Bold weights with slight tracking increases to maintain clarity in the dense customization menus.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a fixed maximum width for content containers on desktop (1440px). 

- **Desktop:** A 12-column grid with 24px gutters. Large 64px side margins are used to give the "map" room to breathe, creating a gallery-like feel.
- **Mobile:** A 4-column grid with 16px margins. Customization tools should transition from sidebars to bottom-anchored "sheets" to keep the map preview visible at all times.
- **Rhythm:** All spacing (padding, margins, gap) must be multiples of the 8px base unit to ensure a mathematical, "snapped-to-grid" feel reminiscent of building blocks.

## Elevation & Depth

To achieve the "LEGO meets Google Maps" vibe, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (The Floor):** The main background (Map White), appearing flat.
2.  **Level 1 (The Mat):** The customization canvas uses a very subtle inner shadow to look inset into the frame.
3.  **Level 2 (The UI Cards):** Controls and panels use a soft, 8% opacity Road Gray shadow with a 12px blur, making them appear to float slightly above the workspace.
4.  **Level 3 (Interacting):** When a user drags an element or clicks a primary button, the shadow deepens and the element scales slightly (1.02x), providing a tactile, "squishy" physical feedback.

Avoid heavy black shadows; instead, use tinted shadows (Road Gray at low opacity) to maintain a clean, airy feel.

## Shapes

The shape language is consistently **Rounded**. Every corner is softened to evoke safety and playfulness. 

- **Containers:** Standard cards and panels use the `rounded-lg` (1rem) setting.
- **Interactive Elements:** Buttons and input fields use the `rounded-xl` (1.5rem) or full pill-shape to make them feel inviting to tap.
- **Icons:** Use a consistent 2px stroke weight with rounded caps and joins to match the typography.

## Components

- **Buttons:** Primary buttons are Caution Yellow with Road Gray text. They feature a subtle "bottom border" (2px darker shade) to simulate a 3D button height.
- **Chips:** Used for selecting mat features (e.g., "Police Station," "Pond"). These should have a light Grass Green background when active, with a small illustrative icon.
- **Customizer Cards:** Feature-rich cards that house "drag-and-drop" elements. They use a white background with a 1px Road Gray stroke at 10% opacity.
- **Input Fields:** Large and chunky. Use a 2px Road Gray border on focus, with Quicksand Bold for the input text.
- **Progress Steppers:** Use stylized "road signs" or "checkpoints" to show the user where they are in the design process (e.g., Layout > Features > Review).
- **Tooltips:** Use high-contrast Road Gray backgrounds with white Quicksand text to provide helpful building tips.