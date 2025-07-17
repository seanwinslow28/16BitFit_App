# Core Concept Document: 16BitFit (Updated)

**Version:** 1.2  
**Date:** July 10, 2025  
**Studio:** 16BitFit

---

## 💡 Concept Summary

**16BitFit** is a mobile “Fitness Pet RPG” that blends 90s Tamagotchi mechanics with 16-bit fighter progression. Users are responsible for the health, mood, and strength of a retro-styled avatar that reacts in real time to their logged fitness and nutrition habits. When users log a workout or healthy meal, the avatar responds with unique animations and sound effects — creating an immediate emotional feedback loop between self-care and character development.

---

## 🎮 Gameplay Vision

### 🔁 The Core Loop
1. The character’s **Energy** (hunger) and **Motivation** (happiness) deplete in real time.
2. When values are low, the avatar visually changes to a “sick,” “sad,” or “chubby” state.
3. Users log real-world actions (workouts, meals).
4. The character animates with a sound effect in response (e.g., flexing, eating, damage blink).
5. The avatar returns to an idle animation that reflects its current stats.

---

### 🧠 Emotional Hook
- **You’re not just tracking habits—you’re caring for someone.**
- Your avatar visibly thrives or suffers based on your actions.
- Consistency is rewarded with evolution to stronger forms.
- Neglect results in visual decline into a "Slump" state.

---

## 👾 Character Animation System

The animation system is a fusion of Figma-based component variants and Phaser-based sprite logic.

### 🔄 Action to Animation Mapping
| Action             | Animation Variant   | Sound             | Duration |
|--------------------|---------------------|-------------------|----------|
| Log salad          | eating_healthy      | crunch.mp3        | 1.5s     |
| Log protein/lifting| flex                | flex.mp3          | 2s       |
| Log workout        | thumbs_up           | success_chime.mp3 | 1.5s     |
| Log junk food/skip | damage_blink        | damage.mp3        | 1s       |

After animations play, the sprite reverts to an idle state depending on:
- **Health < 40:** `idle_sick`
- **Weight > 70:** `idle_chubby`
- **Else:** `idle_healthy`

### 🧩 Sprite Architecture
- All sprite states are defined in Figma (`CharacterSprite` component)
- Variants include: `idle_healthy`, `idle_sick`, `idle_chubby`, `flex`, `thumbs_up`, `eating_healthy`, `damage_blink`
- Each has its own frame rate, sound, and trigger logic
- Displayed in a Phaser canvas (400x300, 3x scale)

---

## 🧬 Avatar Lifecycle

| Stage      | Days Active | Description                      |
|------------|-------------|----------------------------------|
| Newbie     | 1–3         | Learns fast, drains meters quicker |
| Trainee    | 4–14        | Improved animations, balanced stats |
| Fighter    | 15–30       | Better visuals, slower decay       |
| Champion   | 31+         | Max form, unlocks boss perks       |
| Slump      | Inactive 2+ days | Visibly deteriorated; must recover with consistency |

---

## ⚔️ Boss Fights (Phaser)

- Built in Phaser 3 and embedded in a React Native WebView
- Turn-based or tap-timed battles
- Powered by RPG stats (AP, HP)
- Win = EXP + reward animation
- Lose = motivational message + retry

---

## 📱 UI/UX Principles

- GameBoy-style layout with NES.css + Tailwind styling
- Centered character with idle loop
- Buttons: WORKOUT, EAT HEALTHY, FIGHT BOSS
- Status bars for Energy, Motivation, EXP
- 16-bit fonts, pixel textures, scanline overlay

---

## 🔊 Sound Design

- All interactions accompanied by retro SFX
- Music loops by context:
  - Main screen = upbeat chiptune
  - Boss fights = intense 8-bit track
  - Level up = fanfare

---

## 🔧 Technical Highlights

- **Frontend:** React Native + Expo
- **Game Engine:** Phaser 3 (WebView)
- **Backend:** Supabase (auth, real-time, storage, edge functions)
- **Health Sync:** Apple Health / Google Fit
- **State Management:** Zustand + React Query
- **Offline Support:** MMKV for queued actions
- **Push Notifications:** Critical meter alerts

---

## 📈 Why It Works

- Combines proven engagement patterns: Tamagotchi care loop, RPG stat growth, and emotional visual feedback
- Makes logging workouts and meals feel rewarding, not boring
- Built-in motivation through visual decline and character evolution
- Nostalgic styling gives it a unique identity in the fitness space

---

## ✅ MVP Scope

- Avatar care system with animations
- Action-based stat tracking and feedback
- Boss fight module
- Sound + visual effects
- Character evolution and devolution

---

## 🔮 Roadmap Highlights

- AI-powered meal photo scanner
- Avatar generator from user selfie
- PvP boss battles
- Seasonal sprite changes (holiday themes)
- Leaderboards + guild features