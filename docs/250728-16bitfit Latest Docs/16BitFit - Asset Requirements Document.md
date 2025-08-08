# 16BitFit - Asset Requirements Document

## 📋 Character System Reference

**For detailed character personalities, evolution stages, and animation sequences, see:**
`16BitFit-Combined Avatar & Animation Asset Master List.md`

This comprehensive character document contains:
- **10 Character Personalities** (2 genders × 5 types: Trainer, Yoga, Weightlifter, Runner, Cyclist)
- **4,786 total animation sequences** across all characters and evolution stages
- **Dual animation system specifications** (Game Boy home + Street Fighter 2 combat)
- **Character-specific special moves** and fighting styles
- **Production priority phases** and DALL-E prompt templates

---

## **1. Sprite Sheets**

*All sprites must be created in a high-fidelity 16-bit style following the dual animation system outlined in the Combined Avatar & Animation Asset Master List.*

### **1.1. Player Character System** 

**CHARACTER FOUNDATION:**
- **10 Base Character Types** (M_Trainer, F_Trainer, M_Yoga, F_Yoga, M_Weightlifter, F_Weightlifter, M_Runner, F_Runner, M_Cyclist, F_Cyclist)
- **5 Evolution Stages per Character** (Basic, Intermediate, Advanced, Master, Legend)
- **Total Character Sets Required:** 50 complete avatar sets (10 characters × 5 evolution stages)

**DUAL ANIMATION REQUIREMENTS:**

#### **Home Screen Animations** (Game Boy Style)
- **Resolution:** 32x32 to 64x64 pixels
- **Color Palette:** 4 Game Boy greens only (#9BBC0F, #8BAC0F, #306230, #0F380F)
- **Style:** Chunky, blocky pixels with minimal detail
- **Animation:** 12-15 FPS for retro feel
- **Format:** PNG with transparency

**Required Animations per Character/Evolution Stage:**
- **Idle Animation** (4-6 frames) - Character-specific personality expression
- **Positive Reaction** (3-5 frames) - Happy animation for stat increases
- **Negative Reaction** (3-5 frames) - Sad/disappointed animation for stat decreases  
- **Evolution Transform** (8-10 frames) - Glowing transformation sequence

#### **Combat Animations** (Street Fighter 2 Style)
- **Resolution:** 128x128 to 256x256 pixels
- **Color Palette:** Full Game Boy shell colors allowed
- **Style:** Detailed pixel art with smooth animations
- **Animation:** 60 FPS for fighting game precision
- **Format:** Sprite sheets optimized for Phaser 3

**Required Combat Animations per Character/Evolution Stage:**

**Movement & Stance:**
- Idle Stance (4-6 frames) - Ready fighting position
- Walk Forward/Backward (6-8 frames) - Advancing/retreating movement cycle
- Crouch (1-2 frames) - Low defensive position
- Jump (3 frames) - Up, Apex, Down sequence

**Attack Animations:**
- Light Punch (LP) (2-3 frames) - Quick jab attack
- Medium Punch (MP) (3-4 frames) - Standard punch
- Heavy Punch (HP) (4-6 frames) - Powerful punch with windup
- **Character-Specific Special Move** (8-12 frames) - Unique signature attack per personality type

**Defensive & Reaction:**
- Take Hit (2-3 frames) - Recoil from enemy attack
- Block Stance (1 frame) - Defensive guard position
- Dizzy/Stun (4-6 frames) - Stunned state loop
- Throw/Grapple (4-6 frames) - Grab and throw sequence

**Victory & Defeat:**
- Win Pose (6-8 frames) - Victory celebration
- Lose/Defeated (4-6 frames) - Defeat animation

**CHARACTER-SPECIFIC SPECIAL MOVES:**
- **Trainer:** "Motivation Blast" / "Inspiration Wave"
- **Yoga:** "Zen Strike" / "Harmony Burst"  
- **Weightlifter:** "Power Slam" / "Strength Surge"
- **Runner:** "Speed Dash" / "Cardio Combo"
- **Cyclist:** "Endurance Spin" / "Stamina Storm"

### **1.2. Boss Characters** (Street Fighter 2 Style)

**Complete Boss Roster - 6 Bosses × 6 Animations = 36 Boss Sequences:**

#### **Boss 1: Training Dummy**
- **Idle** (1 frame) - Stationary target
- **Take Hit** (2 frames) - Recoil/shake when hit
- **Defeated** (3 frames) - Falls apart/deactivates

#### **Boss 2: Procrastination Phantom** 👻
- **Idle Stance** (4-6 frames) - Ghostly floating
- **Movement** (6-8 frames) - Teleporting dash
- **Primary Attack** (4-6 frames) - Phantom strike
- **Special Attack** (6-10 frames) - Evasion rush
- **Take Hit** (2-3 frames) - Ethereal recoil
- **Defeated** (6-8 frames) - Fading away

#### **Boss 3: Sloth Demon** 🦥
- **Idle Stance** (4-6 frames) - Slow, heavy breathing
- **Movement** (6-8 frames) - Lumbering walk
- **Primary Attack** (4-6 frames) - Lazy swipe
- **Special Attack** (6-10 frames) - Sleep wave
- **Take Hit** (2-3 frames) - Minimal reaction
- **Defeated** (6-8 frames) - Slow collapse

#### **Boss 4: Gym Bully** 💀
- **Idle Stance** (4-6 frames) - Aggressive posturing
- **Movement** (6-8 frames) - Intimidating advance
- **Primary Attack** (4-6 frames) - Bullying jabs
- **Special Attack** (6-10 frames) - Intimidation aura
- **Take Hit** (2-3 frames) - Angry recoil
- **Defeated** (6-8 frames) - Humbled defeat

#### **Boss 5: Stress Titan** ⚡
- **Idle Stance** (4-6 frames) - Crackling energy
- **Movement** (6-8 frames) - Frantic floating
- **Primary Attack** (4-6 frames) - Stress bolt
- **Special Attack** (6-10 frames) - Anxiety storm
- **Take Hit** (2-3 frames) - Energy disruption
- **Defeated** (6-8 frames) - Power drain

#### **Boss 6: Ultimate Slump** 🌊
- **Idle Stance** (4-6 frames) - Final boss presence
- **Movement** (6-8 frames) - Multi-phase movement
- **Primary Attack** (4-6 frames) - Despair wave
- **Special Attack** (6-10 frames) - Ultimate depression
- **Take Hit** (2-3 frames) - Resilient reaction
- **Defeated** (6-8 frames) - Epic transformation to motivation

---

## **2. Audio Files**

*All audio must be in a 16-bit chiptune style.*

### **2.1. Music Tracks (Looping)**

- **M_Theme_Main:** Upbeat, motivational track for the Home Screen and menus
- **M_Theme_Battle:** Intense, fast-paced track for standard battles
- **M_Theme_FinalBoss:** A more epic and dramatic version of the battle theme for the "Ultimate Slump"
- **M_Jingle_Victory:** (5 sec) - A short, triumphant jingle for winning a battle
- **M_Jingle_Defeat:** (5 sec) - A short, somber tune for losing a battle
- **M_Jingle_Evolution:** (8 sec) - A powerful, ascending track for the Evolution Ceremony

### **2.2. Sound Effects (SFX)**

#### **UI SFX:**
- **SFX_UI_Navigate:** A sharp, quick beep for button presses
- **SFX_UI_Confirm:** A positive confirmation sound
- **SFX_UI_Cancel:** A soft negative/back-out sound
- **SFX_Stat_Increase:** A short, ascending chime
- **SFX_Stat_Decrease:** A short, descending buzz
- **SFX_Achievement:** A classic "treasure found" sound

#### **Combat SFX:**
- **SFX_Attack_Whoosh_Light**
- **SFX_Attack_Whoosh_Heavy** 
- **SFX_Hit_Light**
- **SFX_Hit_Medium**
- **SFX_Hit_Heavy**
- **SFX_Block**
- **SFX_Jump**
- **SFX_Land**
- **SFX_Special_Activate**
- **SFX_Dizzy_Start**
- **SFX_Throw_Connect**

---

## **3. UI & Environment Assets**

*All assets must be in a 16-bit pixel art style, adhering to the specified color palettes.*

### **3.1. Logos & Icons**
- **Logo_16BitFit_Full:** The main app logo for the Welcome Screen
- **App_Icon_512x512:** The app icon for the App Stores
- **Icon_Set:** A set of pixel art icons for Battle, Train, Feed, Stats, etc.

### **3.2. Backgrounds & Environments**
- **BG_Battle_TrainingRoom:** The stage for the Training Dummy
- **BG_Battle_Phantom:** The stage for the Procrastination Phantom
- **BG_Battle_Sloth:** The stage for the Sloth Demon
- **BG_Battle_Bully:** The stage for the Gym Bully
- **BG_Battle_Titan:** The stage for the Stress Titan
- **BG_Battle_Slump:** The stage for the Ultimate Slump

### **3.3. UI Components**
- **UI_Button_Frame_Active:** The border/frame for primary buttons
- **UI_Button_Frame_Disabled:** The border/frame for disabled buttons
- **UI_Panel_Frame:** The frame for info panels on the Stats screen
- **UI_HealthBar_Container:** The empty container for health/stat bars
- **UI_HealthBar_Fill:** The texture for the filled portion of the health bar

---

## **4. Technical Specifications & Color Palettes**

### **Color Palettes**

#### **Game Boy Screen (Home Avatars)**
- **Lightest:** #9BBC0F
- **Light:** #8BAC0F  
- **Dark:** #306230
- **Darkest:** #0F380F

#### **Game Boy Shell (Combat UI)**
- **Shell Light Gray:** #C4BEBB
- **Shell Dark Gray:** #545454
- **Button Black:** #272929
- **Magenta Accent:** #9A2257
- **Blue Accent:** #5577AA

### **Asset Production Summary**
- **Home Screen Avatars:** 50 characters × 4 animations × 5 evolution stages = **1,000 sequences**
- **Combat Avatars:** 50 characters × 15 combat animations × 5 evolution stages = **3,750 sequences**  
- **Boss Sprites:** 6 bosses × 6 animations = **36 sequences**
- **Audio Files:** 6 music tracks + 17 sound effects = **23 audio assets**
- **UI & Environment:** Logos, icons, backgrounds, UI components = **~30 assets**

**Grand Total: 4,839 total assets**

---

## **5. Production Priority Phases**

### **Phase 1: MVP Core (Weeks 1-4)**
- 2 base characters (Male/Female Trainer) × 5 evolution stages
- Home screen animations for MVP characters
- Basic combat animations for MVP characters  
- Training Dummy boss sprites
- Core audio assets and UI components

### **Phase 2: Character Expansion (Weeks 5-8)**
- Add Yoga and Weightlifter character types
- Complete home screen and combat animations
- Add Procrastination Phantom and Sloth Demon bosses

### **Phase 3: Full Roster (Weeks 9-12)**
- Complete Runner and Cyclist character types
- All remaining boss sprites
- Polish and optimization passes

### **Phase 4: Advanced Features (Weeks 13-16)**
- Special evolution transformation sequences
- Advanced combat combinations
- Boss victory celebrations
- Character customization accessories

---

*This document works in conjunction with the 16BitFit-Combined Avatar & Animation Asset Master List for complete asset specifications and character system implementation.*