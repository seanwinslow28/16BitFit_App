Here is your **Game Design Document (GDD)** for **16bitFit**, incorporating your coded blue Game Boy-style mockup and full game concept.

---

# **🎮 Game Design Document: 16bitFit**

---

## **🟦 Game Overview**

**Title:** 16bitFit  
 **Genre:** Gamified Fitness RPG / Tamagotchi Hybrid  
 **Platform:** Mobile-first (React Native), expandable to web  
 **Target Audience:** Gen Z/Millennials who love retro games, want a playful health tracker, and appreciate humor \+ nostalgia  
 **Visual Style:** Inspired by Sega Genesis / GameBoy Color / Tamagotchi  
 **Core Concept:** The user raises and trains a 16-bit fighter avatar that evolves based on real-life health habits. Users log meals and workouts, affecting their avatar’s strength, appearance, and ability to battle enemies.

---

## **💻 Interface & Visual Style**

### **Game Shell: Blue Game Boy-Style UI**

You've built a mockup that wraps the entire app in a fullscreen retro-styled interface resembling a blue Game Boy Color, including:

* **D-Pad, A/B Buttons, Start/Select** (non-functional but atmospheric)

* **Blue Gradient Casing**: `#2563eb`, `#1d4ed8`, `#1e40af`

* **Screen Area**: Dark purple housing (`#2d1b69`) with a silver-tinted display screen

* **Speaker Holes \+ Power LED**: Styled pixel details for immersion

✅ *This outer shell never changes and houses all interactive screens inside the virtual “LCD display”*

---

## **🧩 Core Gameplay Mechanics**

### **1\. Create Your Fighter**

* Choose or generate a 16-bit avatar (preset or AI-based in future)

* Characters start with base stats:

  * 💪 Strength

  * 🧠 Focus

  * ❤️ Health

  * ⚡ Endurance

---

### **2\. Real-Life Actions → In-Game Effects**

Users manually log:

* **🥗 Meals** → affects Health & Focus

* **🏋️ Workouts** → boosts Strength & Endurance

* **😴 Rest** → restores balance and prevents burnout

Bad habits (e.g., skipping workouts, junk food) make the character:

* Gain weight, get sluggish, and look sad

* Lose stat points over time

---

### **3\. Evolution System**

Your avatar transforms visually based on your streak:

* Healthy actions → Stronger, confident, glowing character

* Poor actions → Bloated, pale, depressed look

Each stage has:

* New animations (idle, eat, sweat, flex)

* New gear (gloves, outfits)

* Personality changes (quips, motivational sayings)

---

### **4\. Boss Battles**

* At key XP milestones, users unlock a "Boss Battle"

* Bosses are visualized in the style of a classic fighting game

* Combat is animated and determined by:

  * User stats

  * Streak consistency

  * Balance of nutrition and exercise

Winning rewards:

* Badges, XP boost, cosmetics  
   Losing triggers:

* Motivational prompts

* Stat reset (minor)

---

## **📱 Core App Loop**

Open App → View Avatar → Log Meals/Workouts → Avatar Evolves → Earn XP → Battle Boss → Win Rewards → Repeat

---

## **🧪 Game Modes**

| Mode | Description |
| ----- | ----- |
| Tamagotchi Mode | Feed, rest, and train your avatar |
| Fitness Log Mode | Log actions to update stats manually (AI enhancements later) |
| Evolution Viewer | Track your character’s evolution path |
| Boss Battle Mode | Visual turn-based fights with RPG-style logic |
| Stats Screen | XP, health breakdowns, action history |
| Daily Quests | Challenges like “Log 3 healthy meals today” |

---

## **🛠️ Tech Stack**

| Layer | Tech |
| ----- | ----- |
| **Frontend** | React Native (via Expo) \+ your custom GameBoy UI HTML/CSS recreated with styled components |
| **Backend** | Supabase (Auth, DB, Realtime listeners) |
| **Storage** | Supabase storage for avatars & logs |
| **AI Tools (future)** | DALL·E or Leonardo.Ai for avatar generation, Roboflow for meal recognition |
| **Audio** | BFXR or OpenGameArt for retro sound effects |

---

## **🧠 Behavioral Psychology Integration**

| Concept | Example in App |
| ----- | ----- |
| Variable rewards | Unlock random cosmetics or mini-games with healthy streaks |
| Self-determination | Avatar reflects the user’s real behavior |
| Streak reinforcement | Visual evolution tied to consecutive days logged |
| Humorous motivation | Avatar dialogue (e.g., “I’m starving for broccoli\!”) |

---

## **🧱 Art & Asset Guidelines**

* **Resolution**: 16x16 or 32x32 for characters, upscale with nearest-neighbor

* **Color Palette**: NES-inspired (max 16-32 colors per scene)

* **Sprite Generator**: Use [Piskel](https://piskelapp.com/) or PixelVibe for creating assets

---

## **🪙 Monetization Strategy (Post-MVP)**

| Option | Description |
| ----- | ----- |
| Freemium | Free access to core logging \+ avatar |
| Subscription | Boss battles, AI avatars, nutrition scanner, premium gear |
| Cosmetic Store | 16-bit outfits, themes, accessories |
| Brand Partnerships | Gym gear brands, healthy snack companies as in-game sponsors |

---

## **📅 Development Phases**

| Phase | Description |
| ----- | ----- |
| **Phase 1** | Build MVP inside GameBoy shell → Manual logs, avatar sprite, stat screen |
| **Phase 2** | Boss logic \+ animations → XP thresholds, simple combat |
| **Phase 3** | Add evolution system \+ gear unlocks |
| **Phase 4** | Sync Apple Health \+ add AI tools (avatar \+ food scanner) |
| **Phase 5** | Launch on TestFlight \+ Play Store Beta |
| **Phase 6** | Add monetization, shareable avatars, leaderboards |

---

## **📥 Next Steps**

1. ✅ Rebuild your mockup GameBoy shell in React Native (using Expo \+ CSS-in-JS)

2. 🎨 Design in-game screens for:

   * Meal logging

   * Workout input

   * Boss battle scene

   * Stat overview

3. 🧠 Begin sprite generation for avatars and boss characters

4. 🔧 Set up Supabase project with user and stat schema

5. 🚀 Build a vertical slice with the logging → evolution → boss battle loop

