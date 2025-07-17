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

### AuraPulse.tsx
```tsx
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';

export default function AuraPulse({ trigger }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (trigger) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
    }
  }, [trigger]);

  return (
    <Animated.View style={[styles.aura, { transform: [{ scale }], opacity }]} />
  );
}

const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F7D51D',
    zIndex: 3,
  },
});
```

### SparkleFX.tsx
```tsx
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

export default function SparkleFX({ trigger }) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      translateY.setValue(20);
      opacity.setValue(1);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.Image
      source={require('../assets/sprites/fx/sparkle.png')}
      style={[styles.sparkle, { transform: [{ translateY }], opacity }]} />
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    width: 32,
    height: 32,
    zIndex: 6,
  },
});
```

### DamageBlink.tsx
```tsx
import { Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

export default function DamageBlink({ trigger }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'red',
    zIndex: 99,
  },
});
```

You can now compose these FX like:
```tsx
<AuraPulse trigger={powerMode} />
<SparkleFX trigger={completedAction} />
<DamageBlink trigger={tookDamage} />
```
All are layered via `position: 'absolute'` and composable on top of characters, bars, or backgrounds.
