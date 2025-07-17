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
│   ├── FX/ (LevelUpFX.tsx, DamageBlink.tsx, SparkleFX.tsx, AuraPulse.tsx, TapRing.tsx)
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
## ✨ Animated FX Component Examples

### LevelUpFX.tsx
```tsx
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

export default function LevelUpFX({ trigger }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.4, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 300, easing: Easing.ease, useNativeDriver: true })
        ])
      ).start();
    }
  }, [trigger]);

  return (
    <Animated.Image
      source={require('../assets/sprites/fx/level_up.png')}
      style={[styles.fx, { transform: [{ scale }] }]}
    />
  );
}

const styles = StyleSheet.create({
  fx: {
    position: 'absolute',
    width: 64,
    height: 64,
    zIndex: 10
  }
});
```

### TapRing.tsx
```tsx
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';

export default function TapRing({ trigger }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (trigger) {
      scale.setValue(0.5);
      opacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[styles.ring, { transform: [{ scale }], opacity }]} />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
});
```

Use these components inside your layout or character arena like so:

```tsx
<TapRing trigger={tapped} />
<LevelUpFX trigger={justLeveledUp} />
```

These FX can layer on top of characters or stats via `position: 'absolute'`.

---
Continue building with additional animations in the `FX/` directory such as:
- `AuraPulse.tsx` (subtle opacity and scale loop)
- `SparkleFX.tsx` (floating upward shimmer)
- `DamageBlink.tsx` (blink character tint)

Let me know if you'd like those built next.
