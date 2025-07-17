**16BitFit Figma Implementation Specifications**

  Option 1: Complete Detailed Specifications

  I'll provide you with pixel-perfect specifications that you can implement directly in Figma or use  
  with Cursor/Figma MCP tools.

  \---  
  📐 Page 1: Design System Foundation

  Color Palette (Create as Figma Color Styles)

  Primary Colors

  🔵 primary/hero-blue  
     HEX: \#2C76C8  
     RGB: 44, 118, 200  
     HSL: 211°, 64%, 48%

  🟡 primary/logo-yellow  
     HEX: \#F7D51D  
     RGB: 247, 213, 29  
     HSL: 51°, 93%, 54%

  ⚫ primary/black  
     HEX: \#0D0D0D  
     RGB: 13, 13, 13  
     HSL: 0°, 0%, 5%

  🟢 primary/success  
     HEX: \#92CC41  
     RGB: 146, 204, 65  
     HSL: 85°, 58%, 53%

  Game State Colors

  🔴 state/health  
     HEX: \#E53935  
     RGB: 229, 57, 53  
     HSL: 1°, 77%, 55%

  🟠 state/energy  
     HEX: \#FB8C00  
     RGB: 251, 140, 0  
     HSL: 33°, 100%, 49%

  🌸 state/character-pink  
     HEX: \#FCB9B2  
     RGB: 252, 185, 178  
     HSL: 6°, 92%, 84%

  🟩 state/gameboy-green  
     HEX: \#9BBC0F  
     RGB: 155, 188, 15  
     HSL: 71°, 85%, 40%

  Environment Colors

  🌌 env/sky-blue  
     HEX: \#5C94FC  
     RGB: 92, 148, 252  
     HSL: 219°, 96%, 67%

  ☁️ env/sky-light  
     HEX: \#7BA7FC  
     RGB: 123, 167, 252  
     HSL: 220°, 96%, 74%

  🟤 env/dojo-brown  
     HEX: \#8B5A3C  
     RGB: 139, 90, 60  
     HSL: 23°, 40%, 39%

  🌑 env/ground-dark  
     HEX: \#6B5745  
     RGB: 107, 87, 69  
     HSL: 28°, 22%, 35%

  🌃 env/night-purple  
     HEX: \#2E1A47  
     RGB: 46, 26, 71  
     HSL: 267°, 46%, 19%

  Typography System (Create as Figma Text Styles)

  Font Family: 'Press Start 2P'

  📝 title/extra-large  
     Size: 24px  
     Line Height: 32px (133%)  
     Letter Spacing: 0px  
     Text Case: UPPERCASE  
     Color: primary/logo-yellow

  📝 title/large  
     Size: 18px  
     Line Height: 24px (133%)  
     Letter Spacing: 0px  
     Text Case: UPPERCASE  
     Color: primary/black

  📝 title/medium  
     Size: 16px  
     Line Height: 24px (150%)  
     Letter Spacing: 0px  
     Text Case: UPPERCASE  
     Color: primary/black

  📝 button/text  
     Size: 12px  
     Line Height: 16px (133%)  
     Letter Spacing: 0px  
     Text Case: UPPERCASE  
     Color: primary/black

  📝 label/small  
     Size: 10px  
     Line Height: 16px (160%)  
     Letter Spacing: 0px  
     Text Case: Sentence case  
     Color: primary/black

  📝 micro/copy  
     Size: 8px  
     Line Height: 12px (150%)  
     Letter Spacing: 0px  
     Text Case: Sentence case  
     Color: primary/black

  Effect Styles (Create as Figma Effect Styles)

  Button Shadows

  🔘 button/shadow-default  
     Type: Drop Shadow  
     X: 4px, Y: 4px  
     Blur: 0px, Spread: 0px  
     Color: \#6B9431 (success green darkened)  
     Opacity: 100%

  🔘 button/shadow-pressed  
     Type: Drop Shadow  
     X: 2px, Y: 2px  
     Blur: 0px, Spread: 0px  
     Color: \#6B9431  
     Opacity: 100%

  🔘 card/shadow  
     Type: Drop Shadow  
     X: 4px, Y: 4px  
     Blur: 0px, Spread: 0px  
     Color: primary/black  
     Opacity: 50%

  Screen Effects

  📺 scanline/overlay  
     Type: Inner Shadow  
     X: 0px, Y: 0px  
     Blur: 0px, Spread: 0px  
     Color: primary/black  
     Opacity: 15%

     \+ Add Image Fill with custom pattern:  
     \- 2px transparent stripe  
     \- 2px black stripe at 15% opacity  
     \- Repeat vertically

  \---  
  📱 Page 2: Character Arena System

  Master Character Arena Component

  Frame Structure

  🖼️ Character Arena Frame  
     Size: 400px × 240px  
     Corner Radius: 0px  
     Clip Content: Yes  
     Auto Layout: None  
     Name: "Character Arena"

  Layer Hierarchy (Top to Bottom)

  📁 Character Arena  
  ├── 🌅 Background Sky  
  │   └── Rectangle: 400px × 144px  
  │       Position: X:0, Y:0  
  │       Fill: Linear Gradient (90°)  
  │         Stop 1: env/sky-blue (0%)  
  │         Stop 2: env/sky-light (100%)  
  │  
  ├── 🌍 Background Ground  
  │   └── Rectangle: 400px × 96px  
  │       Position: X:0, Y:144px  
  │       Fill: Linear Gradient (90°)  
  │         Stop 1: env/dojo-brown (0%)  
  │         Stop 2: env/ground-dark (100%)  
  │  
  ├── 📺 Scanline Overlay  
  │   └── Rectangle: 400px × 240px  
  │       Position: X:0, Y:0  
  │       Fill: scanline/overlay effect  
  │       Blend Mode: Multiply  
  │       Opacity: 100%  
  │  
  ├── 👾 Character Container  
  │   └── Frame: 128px × 128px  
  │       Position: X:136px, Y:60px (centered horizontally, 60px from top)  
  │       Auto Layout: None  
  │       Clip Content: Yes  
  │  
  │       └── 🎭 Sprite Layers (All at X:0, Y:0 within container)  
  │           ├── Idle\_Pose (Visible by default)  
  │           ├── Flex\_Pose (Hidden)  
  │           ├── Over\_Eating\_Pose (Hidden)  
  │           ├── Post\_Workout\_Pose (Hidden)  
  │           ├── Sad\_Pose (Hidden)  
  │           └── Thumbs\_Up\_Pose (Hidden)  
  │  
  └── ✨ Effects Container  
      └── Frame: 128px × 128px  
          Position: X:136px, Y:60px (same as character)  
            
          └── Effect Layers (All Hidden by default)  
              ├── Level Up Flash (128px × 128px, yellow glow)  
              ├── Sweat Particles (Individual 8px × 8px blue dots)  
              ├── Sparkle Effects (Individual 4px × 4px yellow stars)  
              └── Damage Flash (128px × 128px, red overlay at 50% opacity)

  Sprite Layer Specifications

  Each sprite layer:  
  📏 Size: 128px × 128px  
  📍 Position: X:0, Y:0 (within Character Container)  
  🖼️ Image Fill: Corresponding PNG asset  
  🔧 Image Fit: Fill  
  🎨 Image Rendering: Pixelated (set in CSS later)  
  👁️ Visibility: Only one visible at a time per state

  Component Variants Setup

  🔧 Create Component from Character Arena frame

  📊 Add Variant Property:  
     Property Name: "CharacterState"  
     Type: Variant  
     Default Value: "Idle"

     Values:  
     • Idle (Show: Idle\_Pose only)  
     • Flex (Show: Flex\_Pose only)  
     • Eating (Show: Over\_Eating\_Pose only)  
     • PostWorkout (Show: Post\_Workout\_Pose only)  
     • Sad (Show: Sad\_Pose only)  
     • ThumbsUp (Show: Thumbs\_Up\_Pose only)  
       
  📊 Add Boolean Property:  
     Property Name: "ShowEffects"  
     Type: Boolean  
     Default Value: False  
       
     True: Show effects layer  
     False: Hide effects layer

  \---  
  🔘 Page 3: Button System Components

  Primary Action Button Component

  Frame Structure

  🔘 Action Button Frame  
     Size: 140px × 56px  
     Corner Radius: 0px  
     Auto Layout: Horizontal  
     Padding: 12px 16px  
     Item Spacing: 8px  
     Align Items: Center  
     Justify Content: Center

  Layer Hierarchy

  🔘 Action Button  
  ├── 🎯 Button Background  
  │   └── Rectangle: Fill frame  
  │       Fill: primary/success  
  │       Stroke: 4px solid primary/black  
  │       Corner Radius: 0px  
  │       Effect: button/shadow-default  
  │  
  ├── 🖼️ Icon Container  
  │   └── Frame: 32px × 32px  
  │       └── Icon Image: 32px × 32px  
  │           Image Fit: Fill  
  │  
  └── 📝 Button Text  
      └── Text: "BUTTON TEXT"  
          Style: button/text  
          Color: primary/black  
          Alignment: Center

  Button Variants

  🎮 Add Variant Properties:

  📊 Property: "ButtonType"  
     Values: Workout, Food, Battle, Stats  
     Changes: Icon image source

  📊 Property: "ButtonState"  
     Values: Default, Pressed, Disabled

     Default:  
     \- Background: primary/success  
     \- Effect: button/shadow-default  
     \- Position: X:0, Y:0

     Pressed:  
     \- Background: primary/success (darker 10%)  
     \- Effect: button/shadow-pressed  
     \- Position: X:2px, Y:2px

     Disabled:  
     \- Background: \#6B7280  
     \- Text Color: \#9CA3AF  
     \- Effect: None  
     \- Opacity: 60%

  Stat Bar Component

  Frame Structure

  📊 Stat Bar Frame  
     Size: 280px × 32px  
     Auto Layout: Horizontal  
     Padding: 0px  
     Item Spacing: 12px  
     Align Items: Center

  Layer Hierarchy

  📊 Stat Bar  
  ├── 🏷️ Stat Label  
  │   └── Text: "HEALTH"  
  │       Style: label/small  
  │       Color: primary/black  
  │       Width: 60px  
  │  
  ├── 📈 Progress Container  
  │   └── Frame: 180px × 24px  
  │       Background: env/ground-dark  
  │       Stroke: 2px solid primary/black  
  │       Corner Radius: 0px  
  │  
  │       └── Progress Fill  
  │           Rectangle: Variable width × 24px  
  │           Position: X:0, Y:0  
  │           Fill: Based on stat type  
  │           Corner Radius: 0px  
  │  
  └── 🔢 Stat Value  
      └── Text: "75/100"  
          Style: micro/copy  
          Color: primary/black  
          Width: 40px  
          Alignment: Right

  Stat Bar Variants

  📊 Add Variant Property: "StatType"  
     Values: Health, Energy, Strength, Happiness

     Health:  
     \- Progress Fill: state/health  
     \- Pattern: Diagonal stripes (4px)

     Energy:  
     \- Progress Fill: state/energy  
     \- Pattern: Diagonal stripes (4px)

     Strength:  
     \- Progress Fill: primary/logo-yellow  
     \- Pattern: Diagonal stripes (4px)

     Happiness:  
     \- Progress Fill: primary/success  
     \- Pattern: Diagonal stripes (4px)

  📊 Add Number Property: "CurrentValue"  
     Range: 0-100  
     Controls progress fill width percentage

  📊 Add Number Property: "MaxValue"  
     Default: 100  
     Used in value text display

  \---  
  📱 Page 4: Mobile Screen Layouts

  iPhone Standard Template (375×812px)

  Home Screen Layout

  📱 Home Screen Frame  
     Size: 375px × 812px  
     Background: primary/black  
     Auto Layout: Vertical  
     Padding: 0px  
     Item Spacing: 0px

  Layout Sections (Top to Bottom)

  📱 Home Screen  
  ├── 🔝 Status Bar Area  
  │   └── Frame: 375px × 44px  
  │       Background: Transparent  
  │       (System status bar overlay)  
  │  
  ├── 🎯 Header Section  
  │   └── Frame: 375px × 80px  
  │       Background: primary/black  
  │       Auto Layout: Horizontal  
  │       Padding: 16px 20px  
  │       Justify: Space Between  
  │       Align: Center  
  │  
  │       ├── Logo Text: "🎮 16BIT FIT 🎮"  
  │       │   Style: title/large  
  │       │   Color: primary/logo-yellow  
  │       │  
  │       └── Settings Icon: 32px × 32px  
  │           Background: primary/success  
  │           Corner Radius: 16px  
  │           Icon: Gear symbol  
  │  
  ├── 🎮 Character Arena Section  
  │   └── Frame: 375px × 240px  
  │       Padding: 0px  
  │       Background: Transparent  
  │  
  │       └── Character Arena Component  
  │           Size: 375px × 240px  
  │           CharacterState: Idle  
  │           ShowEffects: False  
  │  
  ├── ⚡ Quick Actions Section  
  │   └── Frame: 375px × 280px  
  │       Background: Transparent  
  │       Auto Layout: Vertical  
  │       Padding: 20px  
  │       Item Spacing: 16px  
  │  
  │       ├── Section Header  
  │       │   └── Text: "⚡ QUICK ACTIONS ⚡"  
  │       │       Style: title/medium  
  │       │       Color: primary/logo-yellow  
  │       │       Alignment: Center  
  │       │  
  │       └── Button Grid  
  │           Frame: 335px × 120px  
  │           Auto Layout: Vertical  
  │           Item Spacing: 8px  
  │  
  │           ├── Top Row (Auto Layout: Horizontal, Spacing: 8px)  
  │           │   ├── Workout Button (163px × 56px)  
  │           │   └── Food Button (163px × 56px)  
  │           │  
  │           └── Bottom Row (Auto Layout: Horizontal, Spacing: 8px)  
  │               ├── Battle Button (163px × 56px)  
  │               └── Stats Button (163px × 56px)  
  │  
  ├── 🔽 Spacer  
  │   └── Frame: 375px × Flexible height  
  │       Background: Transparent  
  │  
  └── 🔻 Bottom Navigation  
      └── Frame: 375px × 88px  
          Background: env/ground-dark  
          Stroke: 2px solid primary/black (top only)  
          Auto Layout: Horizontal  
          Padding: 8px 0px 24px 0px  
          Justify: Space Around

          └── Nav Items (5 total)  
              Frame: 67px × 56px each  
              Auto Layout: Vertical  
              Align: Center  
              Item Spacing: 4px

              ├── Nav Icon: 32px × 32px  
              │   (Use Home\_Screen\_Button\_Sprites)  
              └── Nav Label: Style micro/copy

  Stats Screen Layout

  📊 Stats Screen Frame  
     Size: 375px × 812px  
     Background: primary/black  
     Auto Layout: Vertical

  ├── Header (Same as Home Screen)  
  ├── 👤 Character Display  
  │   └── Frame: 375px × 160px  
  │       Padding: 20px  
  │  
  │       └── Character Arena Component  
  │           Size: 335px × 120px (scaled down)  
  │           CharacterState: Based on current stats  
  │  
  ├── 📈 Stats Panel  
  │   └── Frame: 375px × 300px  
  │       Background: env/ground-dark  
  │       Stroke: 2px solid primary/black  
  │       Padding: 20px  
  │       Auto Layout: Vertical  
  │       Item Spacing: 16px  
  │  
  │       ├── Panel Title: "CHARACTER STATS"  
  │       │   Style: title/medium  
  │       │   Color: primary/logo-yellow  
  │       │  
  │       └── Stat Bars (4 total)  
  │           ├── Health Stat Bar  
  │           ├── Energy Stat Bar  
  │           ├── Strength Stat Bar  
  │           └── Happiness Stat Bar  
  │  
  ├── 🏆 Evolution Panel  
  │   └── Frame: 375px × 120px  
  │       Background: env/dojo-brown  
  │       Stroke: 2px solid primary/black  
  │       Padding: 20px  
  │       Auto Layout: Vertical  
  │       Item Spacing: 8px  
  │  
  │       ├── Evolution Title: "EVOLUTION STAGE"  
  │       ├── Stage Text: "TRAINEE (2/3)"  
  │       └── Streak Text: "🔥 7 DAY STREAK"  
  │  
  └── Bottom Navigation (Same as Home Screen)

  \---  
  🎨 Design System Grid & Spacing

  Base Grid System

  📐 Base Unit: 8px  
     All spacing, padding, and margins use multiples of 8px

  📐 Component Grid: 16px  
     Spacing between major components

  📐 Section Grid: 24px  
     Spacing between major screen sections

  📐 Page Margins: 20px  
     Left and right margins for main content

  Touch Target Specifications

  👆 Minimum Touch Target: 44px × 44px (iOS guidelines)  
  👆 Comfortable Touch Target: 56px × 56px (recommended)  
  👆 Button Height: 56px minimum  
  👆 Icon Size in Buttons: 32px × 32px  
  👆 Spacing Between Touch Targets: 16px minimum

  Responsive Breakpoints

  📱 Small Phone (320px \- 374px):  
     \- Single column action layout  
     \- Reduced padding (16px)  
     \- Smaller character arena (300px × 180px)

  📱 Standard Phone (375px \- 414px):  
     \- 2×2 action button grid  
     \- Standard spacing (20px)  
     \- Full character arena (375px × 240px)

  📱 Large Phone (415px \- 768px):  
     \- 2×3 action button grid possible  
     \- Increased spacing (24px)  
     \- Enhanced effects enabled

  🖥️ Tablet (769px+):  
     \- 3×2 action button grid  
     \- Side navigation possible  
     \- 2x scaled character arena

  \---  
  🎯 Animation Specifications

  Sprite State Transitions

  🎬 Default State: Idle\_Pose  
     Loop: 2-second breathing animation  
     Frames: 3 frames (idle → slight movement → idle)  
     Timing: 0.8s → 0.4s → 0.8s

  🎬 Action Triggered:  
     Step 1: 100ms pause (anticipation)  
     Step 2: 200ms transition to action sprite  
     Step 3: 1500ms hold action sprite  
     Step 4: 200ms transition back to idle  
       
  🎬 Special Cases:  
     Junk Food: Over\_Eating\_Pose (1s) → Sad\_Pose (1s) → Idle\_Pose  
     Level Up: Flash effect → Flex\_Pose (2s) → Idle\_Pose  
     Low Stats: Continuous Sad\_Pose until stats improve

  Button Press Animation

  🔘 Button Press Timing:  
     Touch Down: 0ms  
     \- Transform: translate(2px, 2px)  
     \- Shadow: button/shadow-pressed  
     \- Scale: 98%

     Touch Up: 100ms  
     \- Transform: translate(0px, 0px)  
     \- Shadow: button/shadow-default  
     \- Scale: 100%

     Total Duration: 100ms  
     Easing: ease-out

  Stat Bar Fill Animation

  📊 Stat Change Animation:  
     Duration: 800ms  
     Easing: ease-out  
     Property: width (percentage)

     Steps:  
     1\. Current width → Target width  
     2\. Diagonal stripe pattern moves during animation  
     3\. Number counter increments smoothly  
     4\. Color may change based on thresholds

  \---  
  🔧 Component Properties Reference

  Character Arena Component Properties

  CharacterState (Variant):  
  \- Idle, Flex, Eating, PostWorkout, Sad, ThumbsUp

  ShowEffects (Boolean):  
  \- True: Display particle effects  
  \- False: Hide all effects

  BackgroundType (Variant):  
  \- Outdoor: Sky blue gradient  
  \- Dojo: Brown wooden floor  
  \- Gym: Orange/red lighting  
  \- Night: Purple/dark gradient

  Action Button Component Properties

  ButtonType (Variant):  
  \- Workout: Dumbbell icon  
  \- Food: Apple icon  
  \- Battle: Sword icon  
  \- Stats: Chart icon

  ButtonState (Variant):  
  \- Default: Normal appearance  
  \- Pressed: Translated position, reduced shadow  
  \- Disabled: Grayed out, no interaction

  ButtonText (Text):  
  \- Customizable button label  
  \- Auto-uppercase formatting

  Stat Bar Component Properties

  StatType (Variant):  
  \- Health: Red fill (\#E53935)  
  \- Energy: Orange fill (\#FB8C00)  
  \- Strength: Yellow fill (\#F7D51D)  
  \- Happiness: Green fill (\#92CC41)

  CurrentValue (Number):  
  \- Range: 0-100  
  \- Controls fill width percentage

  MaxValue (Number):  
  \- Default: 100  
  \- Used in display text

  ShowPattern (Boolean):  
  \- True: Diagonal stripe overlay  
  \- False: Solid color fill

  \---  
  📋 Implementation Checklist

  Phase 1: Design System Setup

  \- Create color styles (16 total colors)  
  \- Create text styles (6 typography styles)  
  \- Create effect styles (3 shadow effects)  
  \- Set up 8px base grid  
  \- Create responsive breakpoint frames

  Phase 2: Character System

  \- Create Character Arena component frame (400×240px)  
  \- Add background gradients (sky \+ ground)  
  \- Add scanline overlay effect  
  \- Import and position all 6 sprite assets  
  \- Create character container frame (128×128px)  
  \- Set up sprite layer hierarchy  
  \- Create component variants for each state  
  \- Add effects container for particles

  Phase 3: Button Components

  \- Create Action Button component (140×56px)  
  \- Set up auto-layout with icon \+ text  
  \- Add button state variants (Default/Pressed/Disabled)  
  \- Create Stat Bar component (280×32px)  
  \- Add progress fill animation properties  
  \- Set up stat type variants with colors

  Phase 4: Screen Layouts

  \- Create Home Screen layout (375×812px)  
  \- Position Character Arena component  
  \- Create 2×2 action button grid  
  \- Add bottom navigation with sprite icons  
  \- Create Stats Screen layout  
  \- Add responsive variants for different screen sizes

  Phase 5: Prototyping

  \- Set up interactive button press animations  
  \- Create character state change transitions  
  \- Add navigation between screens  
  \- Test touch target sizes on mobile  
  \- Validate color contrast ratios

  This comprehensive specification should give you everything needed to implement the 16BitFit design  
   system in Figma with pixel-perfect accuracy. Each component can be created as a reusable element  
  that maintains the authentic retro aesthetic while providing modern mobile usability.

