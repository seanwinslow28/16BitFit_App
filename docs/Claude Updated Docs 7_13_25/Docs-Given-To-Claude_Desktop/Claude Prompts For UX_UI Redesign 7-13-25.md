**Phase 1**

You're helping me prototype a React Native (Expo) home screen for my app \*\*16BitFit\*\*. It's styled like a \*\*GameBoy\*\* game but with \*\*Apple-style modern polish\*\* — pixel art meets sleek clarity.  
Design Goals:  
\- 16-bit retro game aesthetic (NES/GameBoy Color)  
\- Clean, modern layout (Apple-style grid, spacing, contrast)  
\- Uses \`Press Start 2P\` font for pixel text  
\- All buttons and containers should be pixel-styled (NES.css or Tailwind-like if needed)  
\- Background is dark (\#0D0D0D), with green GameBoy tint (\#9BBC0F) in main game window  
\- Retro-style scanline effect overlay  
\- Uses placeholder character sprite for now (64x64px)  
Please generate a fully functional \*\*React Native JSX layout prototype\*\* for this Home Screen.  
\---  
\#\#\# 📱 Layout Structure  
\- App Shell container (retro border \+ shadows)  
\- Top Header Bar with “16BIT FIT” logo  
\- Character Arena (mid-screen):  
    \- Green-tinted game window (\#9BBC0F)  
    \- Scanline overlay (repeating linear gradient)  
    \- Character sprite in the center  
\- Stat meters (energy \+ motivation bars) stacked below sprite  
\- Two main action buttons:  
    \- WORKOUT (green primary)  
    \- EAT HEALTHY (green primary)  
\- Bottom nav bar with 3 nav buttons: STATS, BATTLE, HOME  
\---  
\#\#\# 📦 Layout Containers (Retro-Modern Style)  
\- \`.screen-container\`: black background, rounded pixel border, inner shadow  
\- \`.game-window\`: green tint background, border, scanline overlay using \`repeating-linear-gradient\`  
\- \`.character-arena\`: vertically centered flex container  
\- \`.stat-bar\`: 200x16px progress bar with black border, pixel fill, color variants  
    \- \`health-red\`: \#E53935  
    \- \`energy-orange\`: \#FB8C00  
    \- \`primary-green\`: \#92CC41  
\---  
\#\#\# 🎮 Buttons  
\- WORKOUT / EAT HEALTHY: square-edged, green background (\#92CC41), black text, 4px black border, inset shadow when pressed  
\- Nav buttons: STATS / BATTLE / HOME  
    \- yellow (\#F7D51D) pixel font on black background  
    \- pixel icons optional (e.g., heart, sword, home)  
\---  
Please generate the full \*\*React Native component JSX\*\* using inline styles or Tailwind-style classnames. Do not generate dummy logic or APIs — just layout and styling structure. Use placeholder sprites and bar values for now.

After you’ve completed these steps, please let me know before you move on to Phase 2, so I can review your work and see if I’d like to make any changes. 

**PHASE 2**

You're helping me build the next section of my app UI for \*\*16BitFit\*\*, a retro-modern GameBoy-style fitness game that looks like it was designed by \*\*Steve Jobs and Nintendo\*\* in 2025\.  
This prompt focuses on three elements:  
1\. Stat Bars & Progress Meters  
2\. Pixel Iconography  
3\. Animations & Feedback FX  
Use a mix of \*\*pixel-perfect NES-style graphics\*\* and \*\*modern UI structure\*\*. Layout should remain grid-aligned and responsive to mobile portrait screens.  
\---  
\#\#\# 📊 Stat Bars & Progress Meters  
Create 5 horizontal bars stacked vertically with label \+ pixel icon:  
\- ❤️ \*\*Health\*\*: Red bar (\#E53935)  
\- ⚡ \*\*Energy\*\*: Orange bar (\#FB8C00)  
\- 💪 \*\*Strength\*\*: Yellow bar (\#F7D51D)  
\- 😀 \*\*Motivation\*\*: Green bar (\#92CC41)  
\- 🌟 \*\*EXP\*\*: Blue gradient bar with floating star at end (\#2C76C8)  
Each bar should:  
\- Be 200px wide, 16px tall  
\- Use a thick black border (2px) with pixelated interior  
\- Display label and icon on the left (icon: 16x16, label in \`Press Start 2P\`)  
\- Support 3 visual states: default, hover (glow), pressed (inset)  
Use clean flex or grid layout with spacing between rows.  
\---  
\#\#\# 🧩 Iconography  
Use 16x16 pixel icons for:  
\- Heart (health)  
\- Lightning bolt (energy)  
\- Dumbbell or muscle arm (strength)  
\- Smiley face (motivation)  
\- Star (EXP)  
\- Burger (junk food)  
\- Salad (healthy food)  
\- Chart bar (progress screen)  
\- Sword (battle)  
\- Home (navigation)  
Each icon should have 3 states:  
\- Default: pixel filled icon with black outline  
\- Active: glowing or sparkle effect  
\- Disabled: grayscale desaturation  
Use these icons inline next to their relevant stat bar or button.  
\---  
\#\#\# ✨ Animations & Effects  
Simulate sprite-sheet or CSS animation classes (you can stub these for now). Add the following animations:  
1\. \*\*Level Up Sparkle\*\*    
   \- Yellow radial burst effect (6 frames) on EXP bar fill  
   \- Used on level-up, or when EXP bar reaches 100%  
2\. \*\*Damage Blink\*\*  
   \- Red overlay blink on character or stat bar when a negative action occurs  
   \- 3-frame flash: normal → red tint → invisible → repeat  
3\. \*\*Positive Sparkle\*\*  
   \- Green or yellow sparkle particle that floats upward on healthy action  
   \- Triggered on WORKOUT or EAT HEALTHY  
4\. \*\*Aura Pulse\*\*  
   \- Faint glowing pulse that surrounds character sprite when in high Motivation state  
5\. \*\*Tap Feedback\*\*  
   \- White ring pulse animation for button taps (simulate with animated outline or radial fade)  
Please structure these as reusable React Native components or styled \`View\` blocks with animation placeholders (e.g. \`Animated.View\`, or \`className="aura-pulse"\`). Animations can use class-based names for now like \`.level-up-fx\`, \`.damage-blink\`, etc.  
\---  
🛠 Tech Stack Reminder:  
\- React Native (Expo)  
\- NES.css \+ Tailwind style classnames  
\- \`Press Start 2P\` font  
\- Pixel icons and sprites  
\- Inline styles or utility classes are fine  
Do not generate full logic. Focus only on the JSX layout and styling logic using placeholders where needed.  
