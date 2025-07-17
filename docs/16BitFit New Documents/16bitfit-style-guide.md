# 16BitFit UI/UX Style Guide

## Brand Identity

### Logo
- **Primary Logo**: "16BIT FIT" in chunky pixel font
- **Icon**: Simplified flexing arm or dumbbell in 16x16 pixel grid
- **Color**: Yellow/gold text on dark backgrounds, reversible for light backgrounds

### Brand Personality
- **Nostalgic**: 80s/90s arcade and NES era
- **Motivating**: Positive reinforcement through game mechanics
- **Approachable**: Not intimidating, fun fitness for everyone
- **Retro-Modern**: Classic aesthetics with modern UX patterns

## Color Palette

### Primary Colors
```css
/* Based on NES palette and mood board */
--primary-blue: #2C76C8;      /* Hero outfit blue */
--primary-yellow: #F7D51D;    /* 16BIT FIT logo yellow */
--primary-black: #0D0D0D;     /* Deep black for backgrounds */
--primary-green: #92CC41;     /* Success/healthy actions */
```

### Secondary Colors
```css
/* Game state colors */
--health-red: #E53935;        /* Health bar / damage */
--energy-orange: #FB8C00;     /* Stamina / energy */
--muscle-pink: #FCB9B2;       /* Character skin tone */
--gameboy-green: #9BBC0F;     /* Retro screen tint */
```

### Background Colors
```css
/* Environment colors from mood board */
--sky-blue: #5C94FC;          /* Outdoor training area */
--ground-brown: #8B5A3C;      /* Dojo floor */
--sunset-orange: #FF6B35;     /* Gym lighting */
--night-purple: #2E1A47;      /* Night training scenes */
```

### UI State Colors
```css
/* Semantic colors */
--success: #92CC41;           /* Positive actions */
--warning: #F7D51D;           /* Attention needed */
--error: #E53935;             /* Negative actions */
--info: #2C76C8;              /* Information */
--disabled: #636363;          /* Inactive states */
```

## Typography

### Font Hierarchy
```css
/* Primary Font */
font-family: 'Press Start 2P', monospace;

/* Font Sizes */
--font-size-h1: 24px;         /* Main titles */
--font-size-h2: 16px;         /* Section headers */
--font-size-body: 12px;       /* Button text, stats */
--font-size-small: 10px;      /* Labels, hints */
--font-size-tiny: 8px;        /* Micro copy */

/* Line Heights */
line-height: 1.5;             /* All text for readability */
```

### Text Styling Rules
- ALL CAPS for buttons and important labels
- Sentence case for descriptive text
- No italics (doesn't render well in pixel fonts)
- Bold achieved through color contrast, not font weight

## Component Library

### Buttons

#### Primary Action Button
```css
.btn-primary {
  background: var(--primary-green);
  color: var(--primary-black);
  border: 4px solid var(--primary-black);
  padding: 12px 24px;
  font-size: var(--font-size-body);
  text-transform: uppercase;
  box-shadow: 4px 4px 0px var(--primary-black);
}

.btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px var(--primary-black);
}
```

#### Game Boy Style Buttons
```css
.btn-gameboy {
  background: #565656;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  border: 3px solid #000;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.5);
}
```

### Containers

#### Screen Container (Phone Mockup Style)
```css
.screen-container {
  background: var(--primary-black);
  border: 8px solid #2A2A2A;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    inset 0 0 20px rgba(0,0,0,0.5),
    0 8px 16px rgba(0,0,0,0.3);
}
```

#### Game Window
```css
.game-window {
  background: var(--gameboy-green);
  border: 4px solid var(--primary-black);
  image-rendering: pixelated;
  position: relative;
}

.game-window::before {
  /* Scanline effect */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
}
```

### Progress Bars

#### Stat Bars
```css
.stat-bar {
  height: 16px;
  background: #000;
  border: 2px solid #000;
  position: relative;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background-image: repeating-linear-gradient(
    90deg,
    currentColor 0,
    currentColor 8px,
    transparent 8px,
    transparent 10px
  );
}

/* Color variants */
.stat-bar-health { color: var(--health-red); }
.stat-bar-stamina { color: var(--energy-orange); }
.stat-bar-strength { color: var(--primary-yellow); }
```

### Character Display

#### Arena Background
- Gradient sky (blue to lighter blue)
- Pixel art clouds (optional)
- Ground line at 60% height
- Subtle grid pattern overlay

#### Character Container
```css
.character-arena {
  background: linear-gradient(
    to bottom,
    #5C94FC 0%,
    #7BA7FC 60%,
    #8B7355 60%,
    #6B5745 100%
  );
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
```

## Layout Patterns

### Screen Navigation
```
┌─────────────────────────┐
│      16BIT FIT         │ <- Header (fixed)
├─────────────────────────┤
│                         │
│     [Character]         │ <- Main content
│                         │
├─────────────────────────┤
│ [WORKOUT] [EAT HEALTHY] │ <- Action buttons
└─────────────────────────┘
```

### Information Hierarchy
1. **Character/Visual** - Largest element, center focus
2. **Primary Actions** - Large, colorful buttons
3. **Stats/Progress** - Secondary screen or smaller display
4. **Navigation** - Minimal, bottom tab or simple buttons

## Animation Guidelines

### Sprite Animations
- **Frame Rate**: 4-8 FPS for idle, 8-12 FPS for actions
- **Easing**: None (instant transitions between frames)
- **Duration**: 
  - Idle loop: 2-3 seconds
  - Action animations: 1-2 seconds
  - Damage/feedback: 0.5-1 second

### UI Transitions
```css
/* Pixel-perfect transitions */
.pixel-transition {
  transition: none; /* Instant for authentic feel */
}

/* Exception: button presses */
.button-press {
  transition: transform 50ms, box-shadow 50ms;
}
```

### Visual Effects
- **Damage Flash**: Red tint + opacity blink
- **Power Up**: Yellow sparkle particles
- **Level Up**: Screen flash + scaling
- **Selection**: Flashing outline (2px white border)

## Mobile-Specific Patterns

### Touch Targets
- **Minimum Size**: 48x48px (following material guidelines)
- **Spacing**: 8px minimum between interactive elements
- **Visual Feedback**: Immediate color change on touch

### Gesture Support
- **Tap**: Primary interaction
- **Swipe**: Navigation between screens only
- **Long Press**: Show tooltips/info
- **Pinch/Zoom**: Disabled (maintain pixel perfect display)

### Responsive Breakpoints
```css
/* Portrait orientation primary */
@media (max-width: 375px) {
  /* Small phones: 2-column action grid */
}

@media (min-width: 376px) and (max-width: 768px) {
  /* Standard phones: 3-column action grid */
}

@media (min-width: 769px) {
  /* Tablets: Scale up 2x, maintain layout */
}
```

## Sound Design Guidelines

### UI Sounds
- **Button Press**: Short 8-bit "blip" (100ms)
- **Success Action**: Rising chiptune arpeggio (300ms)
- **Error/Damage**: Descending "bwoop" (200ms)
- **Level Up**: Classic victory fanfare (2s)

### Background Music
- **Style**: 8-bit chiptune, 120-140 BPM
- **Layers**: 
  - Base: Simple drum loop
  - Melody: Motivational, major key
  - Intensity: Increases with power level

## Iconography

### Pixel Art Icons (16x16 grid)
- **Food Icons**: Simplified, recognizable shapes
- **Exercise Icons**: Action poses, not detailed
- **Status Icons**: Heart, lightning bolt, muscle
- **UI Icons**: Arrows, hamburger menu, close X

### Icon Colors
- **Monochrome**: Default state
- **Colored**: Active/selected state
- **Grayed**: Disabled/locked state

## Environment Designs

### Training Locations (from mood board)
1. **Outdoor Arena**: Blue sky, simple ground
2. **Classic Dojo**: Wood floors, traditional elements
3. **Modern Gym**: Orange lighting, equipment silhouettes
4. **Night Training**: Purple/dark atmosphere

### Environmental Storytelling
- Time of day affects background
- Weather effects (rain = reduced visibility)
- Location changes based on level progression

## Accessibility Considerations

### Color Contrast
- **Text on Background**: Minimum 7:1 ratio
- **Interactive Elements**: Clear borders, not just color
- **Status Indicators**: Icons + color (not color alone)

### Pixel Font Readability
- **Increased Spacing**: 1.5x line height minimum
- **Larger Sizes**: 10px minimum for body text
- **High Contrast Mode**: Pure black/white option

### Motion Sensitivity
- **Reduce Motion Option**: Disables screen shake, flashing
- **Pause Animations**: Setting to freeze character idle
- **Simple Mode**: Removes particle effects

## Implementation Notes

### Performance Optimization
```css
/* Force hardware acceleration */
.game-element {
  transform: translateZ(0);
  will-change: transform;
}

/* Optimize pixel art rendering */
* {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### Asset Guidelines
- **Sprites**: PNG with transparency, power of 2 dimensions
- **Backgrounds**: JPG for photos, PNG for pixel art
- **Audio**: MP3 for music, WAV for short SFX
- **File Naming**: lowercase_with_underscores.ext

## Do's and Don'ts

### Do's ✓
- Keep it simple and readable
- Use consistent pixel grid (8x8 or 16x16)
- Embrace the constraints of retro design
- Make touch targets finger-friendly
- Test on real devices for pixel clarity

### Don'ts ✗
- Don't use anti-aliasing on pixel art
- Don't mix pixel densities in same screen
- Don't use gradients except for backgrounds
- Don't animate at 60fps (wastes battery)
- Don't forget the scanline effect

## Example Implementation

```html
<!-- Home Screen Structure -->
<div class="screen-container">
  <header class="game-header">
    <h1 class="logo">16BIT FIT</h1>
  </header>
  
  <div class="character-arena">
    <div class="scanline-overlay"></div>
    <canvas class="character-sprite"></canvas>
  </div>
  
  <div class="action-panel">
    <button class="btn-primary btn-healthy">
      WORKOUT
    </button>
    <button class="btn-primary btn-food">
      EAT HEALTHY
    </button>
  </div>
  
  <nav class="game-nav">
    <button class="btn-nav">STATS</button>
    <button class="btn-nav">BATTLE</button>
  </nav>
</div>
```

This style guide ensures your app maintains the authentic retro gaming aesthetic while providing a modern, accessible user experience.