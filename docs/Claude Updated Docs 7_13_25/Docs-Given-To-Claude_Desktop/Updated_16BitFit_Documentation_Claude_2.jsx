---
## 📦 Project: 16BitFit Retro-Modern App UI

A modern 16-bit inspired mobile fitness RPG app built in React Native (Expo), combining GameBoy/NES pixel charm with Apple-style clean UX. This Claude-ready documentation outlines component architecture, styling rules, icon/FX usage, and layout patterns.

---
## 🧱 File Structure Overview

```
16bitfit-app/
├── App.tsx
├── assets/
│   ├── sprites/ (characters + FX)
│   ├── icons/ (UI + stat icons)
│   └── backgrounds/ (dojo, battle)
├── components/
│   ├── HomeScreen.tsx
│   ├── CharacterArena.tsx
│   ├── StatBars/ (StatBar.tsx, ExpBar.tsx, StatIcon.tsx)
│   ├── Buttons/ (ActionButton.tsx, NavButton.tsx, ToggleButton.tsx)
│   ├── FX/ (LevelUpFX.tsx, DamageBlink.tsx, SparkleFX.tsx, etc.)
│   └── Layout/ (ScreenContainer.tsx, GameWindow.tsx, HeaderBar.tsx)
├── constants/ (colors.ts, stats.ts, icons.ts)
├── styles/ (nes.css, tailwind.config.js, global.ts)
├── store/ (characterStore.ts, statStore.ts, gameStore.ts)
├── services/ (phaserBridge.ts)
├── navigation/ (AppNavigator.tsx)
├── types/ (index.ts)
└── README.md
```

---
## 🏠 Home Screen Design Prompt

**Claude Prompt**:

> You're helping me prototype a React Native (Expo) home screen for my app **16BitFit**. It's styled like a **GameBoy** game but with **Apple-style modern polish** — pixel art meets sleek clarity. Include: 
> - Header bar with 16BIT FIT logo
> - Green-tinted character arena with scanline overlay
> - 2 main action buttons: WORKOUT and EAT HEALTHY
> - Stat bars: Health, Energy, Strength, Motivation, EXP
> - Bottom nav with 3 buttons: STATS, BATTLE, HOME
> - Use Press Start 2P font, NES.css or pixel-styled classes
> - Structure UI with Tailwind-style classnames or inline styles
> - Design for an iPhone 15 Plus screen size (430 x 932 points)

---
## 📊 Stat Bars & Progress Meters

Each stat bar is:
- 200x16px, pixel border, filled with:
  - Health: #E53935
  - Energy: #FB8C00
  - Strength: #F7D51D
  - Motivation: #92CC41
  - EXP: #2C76C8 + star icon

Each bar includes:
- Label in `Press Start 2P`
- Left-side 16x16 icon
- 3 States: default, hover (glow), pressed (inset)
- Animated fill using `Animated.View` to smoothly reflect changing values

---
## 🧩 Iconography

Use pixel icons (16x16) for:
- ❤️ Heart (Health)
- ⚡ Lightning (Energy)
- 💪 Dumbbell (Strength)
- 😀 Smiley (Motivation)
- 🌟 Star (EXP)
- 🍔 Burger (Unhealthy)
- 🥗 Salad (Healthy)
- 🏠 Home, 📊 Chart, 🗡️ Sword (Nav)

Each has:
- Default (full color)
- Active (glow)
- Disabled (grayed)
- Optionally animated with `Animated.View` for hover/tap bounce or pulse feedback

---
## ✨ Animations & FX Components

Use `FX/` folder for animation layers or sprite sheet overlays. Use `Animated.View` wrappers for animated sprites or feedback.

- `LevelUpFX.tsx`: radial gold burst animation (6 frames, looped via `Animated.loop`)
- `DamageBlink.tsx`: red/transparent blink animation toggled with `Animated.sequence`
- `SparkleFX.tsx`: rising sparkle using `Animated.timing` + translateY
- `AuraPulse.tsx`: pulsing aura opacity or scale using `Animated.loop`
- `TapRing.tsx`: expanding white ripple using `Animated.scale` and `Animated.opacity`

Animations should be encapsulated in their own components and triggered by props or local state changes.

---
## 📁 Sample Component Folder: StatBars

```tsx
// StatBar.tsx
import { View, Text, Image, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function StatBar({ label, icon, fillColor, value }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-row items-center space-x-2">
      <Image source={icon} style={{ width: 16, height: 16 }} />
      <Text className="text-xs font-pixel">{label}</Text>
      <View className="stat-bar border-2 border-black w-[200px] h-4">
        <Animated.View className="stat-bar-fill h-full" style={{ width, backgroundColor: fillColor }} />
      </View>
    </View>
  )
}
```

---
## 🧠 Developer Notes

- Use `image-rendering: pixelated` everywhere
- Use `Press Start 2P` font globally
- Align everything to an 8px grid
- Use sprite sheets with transparent backgrounds for FX
- Structure as modular atomic components — no hard-coded layouts
- Prototype layout for **iPhone 15 Plus** (screen size: **430px x 932px**)
- Use `Animated.View` for all visual feedback: bar fills, aura pulses, tap ripples, etc.

---
## 📡 Next Claude Modules

1. BattleScreen.tsx (Phaser integration)
2. StatsScreen.tsx (Progress over time)
3. Modal overlays (Food / Workout picker)
4. Character evolution logic
5. Real-time decay + FX triggers
