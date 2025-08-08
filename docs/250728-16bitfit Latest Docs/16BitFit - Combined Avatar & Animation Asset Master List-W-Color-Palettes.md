# 16BitFit - Combined Avatar & Animation Asset Master List

## 🎮 DUAL ANIMATION SYSTEM OVERVIEW

**Home Screen:** Game Boy 4-color pixel art style (32x32 to 64x64 pixels)
**Boss Battles:** Street Fighter 2 style combat sprites (larger, more detailed)

---

## 👥 CHARACTER FOUNDATION SYSTEM

### Base Character Types (2 Genders × 5 Personalities = 10 Base Characters)

#### Male Base Characters
- [ ] **M_Trainer** - Athletic instructor type, confident stance
- [ ] **M_Yoga** - Zen/meditation focused, calm demeanor  
- [ ] **M_Weightlifter** - Strength focused, muscular build emphasis
- [ ] **M_Runner** - Cardio enthusiast, lean athletic build
- [ ] **M_Cyclist** - Endurance athlete, balanced build

#### Female Base Characters
- [ ] **F_Trainer** - Athletic instructor type, confident stance
- [ ] **F_Yoga** - Zen/meditation focused, calm demeanor
- [ ] **F_Weightlifter** - Strength focused, muscular build emphasis  
- [ ] **F_Runner** - Cardio enthusiast, lean athletic build
- [ ] **F_Cyclist** - Endurance athlete, balanced build

---

## 🏠 HOME SCREEN AVATARS (Game Boy Pixel Art Style)

### Evolution Stages Per Character (5 Stages × 10 Characters = 50 Complete Avatar Sets)

Each character type needs all 5 evolution stages with Game Boy aesthetics:

#### Stage 1: Basic (Beginner Fitness Level)
**Visual Characteristics:**
- Slouched posture, uncertain expression
- Basic gym clothes, loose fitting
- Minimal muscle definition
- Neutral or slightly nervous demeanor

**Required Animations Per Character:**
- [ ] **Idle Animation** (4-6 frames) - Nervous breathing, looking around
- [ ] **Positive Reaction** (3-5 frames) - Small smile, encouragement gesture
- [ ] **Negative Reaction** (3-5 frames) - Disappointed slump, head down
- [ ] **Evolution Transform** (8-10 frames) - Glowing transformation sequence

#### Stage 2: Intermediate (10 Workouts)
**Visual Characteristics:**
- Improved posture, more alert
- Better fitting clothes
- Slight muscle definition
- Increased confidence

**Required Animations Per Character:**
- [ ] **Idle Animation** (4-6 frames) - Confident breathing, ready stance
- [ ] **Positive Reaction** (3-5 frames) - Enthusiastic thumbs up
- [ ] **Negative Reaction** (3-5 frames) - Determined despite setback
- [ ] **Evolution Transform** (8-10 frames) - Energy surge transformation

#### Stage 3: Advanced (30 Workouts)
**Visual Characteristics:**
- Noticeably muscular and toned
- Athletic wear, tank tops
- Confident expression
- Power stance

**Required Animations Per Character:**
- [ ] **Idle Animation** (4-6 frames) - Strong, confident posture
- [ ] **Positive Reaction** (3-5 frames) - Victory flex
- [ ] **Negative Reaction** (3-5 frames) - Motivated to improve
- [ ] **Evolution Transform** (8-10 frames) - Muscle definition glow

#### Stage 4: Master (50 Workouts)
**Visual Characteristics:**
- Heroic posture and presence
- Defined muscles, perfect form
- Aura effects starting to appear
- Leadership qualities

**Required Animations Per Character:**
- [ ] **Idle Animation** (4-6 frames) - Heroic stance with subtle aura
- [ ] **Positive Reaction** (3-5 frames) - Champion celebration
- [ ] **Negative Reaction** (3-5 frames) - Mentor-like encouragement
- [ ] **Evolution Transform** (8-10 frames) - Energy aura expansion

#### Stage 5: Legend (75 Workouts)
**Visual Characteristics:**
- God-like physique and symmetry
- Constant energy aura/glow effects
- Floating particles around character
- Ultimate fitness form

**Required Animations Per Character:**
- [ ] **Idle Animation** (4-6 frames) - Legendary presence with particles
- [ ] **Positive Reaction** (3-5 frames) - Divine celebration
- [ ] **Negative Reaction** (3-5 frames) - Wise, encouraging response
- [ ] **Evolution Transform** (8-10 frames) - Ultimate transformation burst

### DALL-E Prompts for Home Screen Avatars

#### Base Prompt Template:
```
"Game Boy Color pixel art character, 32x32 pixels, using only 4 shades of green (#9BBC0F light, #8BAC0F medium, #306230 dark, #0F380F darkest), chunky blocky pixels, minimal detail, retro 1990s handheld game aesthetic, [CHARACTER_TYPE], [GENDER], [EVOLUTION_STAGE], square format, white background"
```

#### Character-Specific Modifiers:
- **Trainer:** "fitness instructor, confident stance, athletic wear"
- **Yoga:** "meditation pose, serene expression, comfortable clothes"
- **Weightlifter:** "muscular build, gym attire, strong pose"
- **Runner:** "lean athletic build, running gear, dynamic stance"
- **Cyclist:** "balanced build, cycling outfit, active pose"

#### Evolution Stage Modifiers:
- **Basic:** "slouched posture, uncertain expression, loose clothes"
- **Intermediate:** "improved posture, alert stance, better fitting clothes"
- **Advanced:** "muscular definition, confident pose, athletic wear"
- **Master:** "heroic stance, subtle aura glow, perfect form"
- **Legend:** "god-like physique, energy particles, glowing aura"

---

## ⚔️ COMBAT AVATARS (Street Fighter 2 Style)

### Full Combat Animation Sets Per Character (15 Animations × 50 Characters = 750 Combat Sequences)

Each of the 50 home screen characters needs a complete Street Fighter 2 style combat sprite set:

#### Core Combat Animations (Required for Every Character/Evolution)

##### Movement & Stance
- [ ] **Idle Stance** (4-6 frames) - Ready fighting position
- [ ] **Walk Forward** (6-8 frames) - Advancing movement cycle
- [ ] **Walk Backward** (6-8 frames) - Retreating movement cycle
- [ ] **Crouch** (1-2 frames) - Low defensive position
- [ ] **Jump** (3 frames) - Up, Apex, Down sequence

##### Attack Animations
- [ ] **Light Punch (LP)** (2-3 frames) - Quick jab attack
- [ ] **Medium Punch (MP)** (3-4 frames) - Standard punch
- [ ] **Heavy Punch (HP)** (4-6 frames) - Powerful punch with windup
- [ ] **Special Move** (8-12 frames) - Unique signature attack per character type

##### Defensive & Reaction
- [ ] **Take Hit** (2-3 frames) - Recoil from enemy attack
- [ ] **Block Stance** (1 frame) - Defensive guard position
- [ ] **Dizzy/Stun** (4-6 frames) - Stunned state loop
- [ ] **Throw/Grapple** (4-6 frames) - Grab and throw sequence

##### Victory & Defeat
- [ ] **Win Pose** (6-8 frames) - Victory celebration
- [ ] **Lose/Defeated** (4-6 frames) - Defeat animation

#### Character-Specific Special Moves

##### Trainer Special Moves
- **Male Trainer:** "Motivation Blast" - Energy punch with encouraging aura
- **Female Trainer:** "Inspiration Wave" - Supportive energy attack

##### Yoga Special Moves  
- **Male Yoga:** "Zen Strike" - Calm, focused chi attack
- **Female Yoga:** "Harmony Burst" - Balanced energy wave

##### Weightlifter Special Moves
- **Male Weightlifter:** "Power Slam" - Heavyweight ground pound
- **Female Weightlifter:** "Strength Surge" - Muscular power attack

##### Runner Special Moves
- **Male Runner:** "Speed Dash" - Lightning-fast rush attack
- **Female Runner:** "Cardio Combo" - Rapid multi-hit sequence

##### Cyclist Special Moves
- **Male Cyclist:** "Endurance Spin" - Spinning wheel attack
- **Female Cyclist:** "Stamina Storm" - Cyclone-style attack

---

## 👹 BOSS BATTLE SPRITES (Street Fighter 2 Style)

### Complete Boss Roster (6 Bosses × 6 Animations = 36 Boss Sequences)

#### Boss 1: Training Dummy
- [ ] **Idle** (1 frame) - Stationary target
- [ ] **Take Hit** (2 frames) - Recoil/shake
- [ ] **Defeated** (3 frames) - Falls apart

#### Boss 2: Procrastination Phantom 👻
- [ ] **Idle Stance** (4-6 frames) - Ghostly floating
- [ ] **Movement** (6-8 frames) - Teleporting dash
- [ ] **Primary Attack** (4-6 frames) - Phantom strike
- [ ] **Special Attack** (6-10 frames) - Evasion rush
- [ ] **Take Hit** (2-3 frames) - Ethereal recoil
- [ ] **Defeated** (6-8 frames) - Fading away

#### Boss 3: Sloth Demon 🦥
- [ ] **Idle Stance** (4-6 frames) - Slow, heavy breathing
- [ ] **Movement** (6-8 frames) - Lumbering walk
- [ ] **Primary Attack** (4-6 frames) - Lazy swipe
- [ ] **Special Attack** (6-10 frames) - Sleep wave
- [ ] **Take Hit** (2-3 frames) - Minimal reaction
- [ ] **Defeated** (6-8 frames) - Slow collapse

#### Boss 4: Gym Bully 💀
- [ ] **Idle Stance** (4-6 frames) - Aggressive posturing
- [ ] **Movement** (6-8 frames) - Intimidating advance
- [ ] **Primary Attack** (4-6 frames) - Bullying jabs
- [ ] **Special Attack** (6-10 frames) - Intimidation aura
- [ ] **Take Hit** (2-3 frames) - Angry recoil
- [ ] **Defeated** (6-8 frames) - Humbled defeat

#### Boss 5: Stress Titan ⚡
- [ ] **Idle Stance** (4-6 frames) - Crackling energy
- [ ] **Movement** (6-8 frames) - Frantic floating
- [ ] **Primary Attack** (4-6 frames) - Stress bolt
- [ ] **Special Attack** (6-10 frames) - Anxiety storm
- [ ] **Take Hit** (2-3 frames) - Energy disruption
- [ ] **Defeated** (6-8 frames) - Power drain

#### Boss 6: Ultimate Slump 🌊
- [ ] **Idle Stance** (4-6 frames) - Final boss presence
- [ ] **Movement** (6-8 frames) - Multi-phase movement
- [ ] **Primary Attack** (4-6 frames) - Despair wave
- [ ] **Special Attack** (6-10 frames) - Ultimate depression
- [ ] **Take Hit** (2-3 frames) - Resilient reaction
- [ ] **Defeated** (6-8 frames) - Epic transformation to motivation

---

## 🎨 TECHNICAL SPECIFICATIONS

### Home Screen Avatars (Game Boy Style)
- **Resolution:** 32x32 to 64x64 pixels
- **Color Palette:** 4 Game Boy greens only
- **Style:** Chunky, blocky pixels with minimal detail
- **Animation:** 12-15 FPS for retro feel
- **Format:** PNG with transparency

### Combat Avatars (Street Fighter Style)  
- **Resolution:** 128x128 to 256x256 pixels
- **Color Palette:** Full Game Boy shell colors allowed
- **Style:** Detailed pixel art with smooth animations
- **Animation:** 60 FPS for fighting game precision
- **Format:** Sprite sheets optimized for Phaser 3

### Color Palettes

#### Game Boy Screen (Home Avatars)
- **Lightest:** #9BBC0F
- **Light:** #8BAC0F  
- **Dark:** #306230
- **Darkest:** #0F380F

#### Game Boy Shell (Combat UI)
- **Shell Light Gray:** #C4BEBB
- **Shell Dark Gray:** #545454
- **Button Black:** #272929
- **Magenta Accent:** #9A2257
- **Blue Accent:** #5577AA

#### Sean – Combat Color Key
### Clothing & Accessories
- **Black T-Shirt: #212121 (deep charcoal black for better pixel shading than pure black)
- **Dark Gray Gym Pants: #424242 (medium-dark neutral gray for contrast with shirt)
- **White Shoes: #F5F5F5 (neutral white with slight gray tone for pixel edge definition)
### Hair & Skin
- **Dirty Blonde Hair: #C2A769 (warm muted blonde for natural shading in pixel art)
- **Light Skin Tone: #F5D6C6 (soft peach tone, consistent with Mary’s base skin tone)
### Outline & Shading
- **Dark Outline: #272727 (near-black outline for sprite clarity)
- **Shirt Shadow: #111111 (slightly darker than shirt base for folds and depth)
- **Pant Shadow: #2E2E2E (deep gray for pant creases)

#### Mary – Basic Stage Combat Color Key
### Clothing & Accessories
-**Pink Tank Top: #FF7BAC (bright saturated pink, SNES/arcade palette friendly)
-**Purple Shorts: #7E57C2 (medium purple, good contrast with pink)
-**Purple Headband: #9C27B0 (slightly deeper purple than shorts for variation)
-**White Shoes: #F5F5F5 (neutral white with slight gray for pixel definition)
### Hair & Skin
-**Brown Hair: #6D4C41 (medium warm brown, works well in pixel shading)
-**Light Skin Tone: #F5D6C6 (soft peach tone, adaptable for pixel art highlights/shadows)
### Outline & Shading
-**Dark Outline: #272727 (near-black, keeps sprite readable at small sizes)
-**Shadow Purple: #5E35B1 (for shorts/headband shading)
-**Shadow Pink: #E91E63 (for tank top shading)

---

## 📊 ASSET PRODUCTION SUMMARY

### Total Asset Count
- **Home Screen Avatars:** 50 characters × 4 animations × 5 evolution stages = **1,000 sequences**
- **Combat Avatars:** 50 characters × 15 combat animations × 5 evolution stages = **3,750 sequences**  
- **Boss Sprites:** 6 bosses × 6 animations = **36 sequences**
- **Grand Total:** **4,786 animation sequences**

### Production Priority Phases

#### Phase 1: MVP Core (Weeks 1-4)
- [ ] 2 base characters (Male/Female Trainer) × 5 evolution stages
- [ ] Home screen animations for MVP characters
- [ ] Basic combat animations for MVP characters
- [ ] Training Dummy boss sprites

#### Phase 2: Character Expansion (Weeks 5-8)
- [ ] Add Yoga and Weightlifter character types
- [ ] Complete home screen and combat animations
- [ ] Add Procrastination Phantom and Sloth Demon bosses

#### Phase 3: Full Roster (Weeks 9-12)
- [ ] Complete Runner and Cyclist character types
- [ ] All remaining boss sprites
- [ ] Polish and optimization passes

#### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Special evolution transformation sequences
- [ ] Advanced combat combinations
- [ ] Boss victory celebrations
- [ ] Character customization accessories

---

## 🎯 CHARACTER PERSONALITY IMPLEMENTATION

### Avatar Selection UI
Users choose their base character type and gender, which determines:
- **Home screen idle animations**
- **Combat fighting style and special moves**
- **Reaction animations to fitness progress**
- **Evolution transformation effects**

### Personality-Driven Features
- **Trainer:** Motivational messages and confident animations
- **Yoga:** Calm reactions and balanced combat style
- **Weightlifter:** Strength-focused moves and power celebrations
- **Runner:** Fast animations and endurance-based specials
- **Cyclist:** Balanced stats and cycling-themed attacks

This comprehensive system creates a deeply personalized fitness gaming experience where users see their chosen avatar personality grow and evolve alongside their real-world fitness journey! 🎮💪
