### **1\. Sprite Sheets**

*All sprites must be created in a high-fidelity 16-bit style. Combat sprites must use the 4-color "Green Screen" palette. UI/Meta-game sprites can use a slightly expanded palette for clarity but should maintain the retro aesthetic.*

#### **1.1. Player Character (One complete set required for EACH of the 5 Evolution Stages)**

* **Combat Animations:**  
  * Idle Stance: (4-6 frames) \- Confident, ready stance.  
  * Walk Forward/Backward: (6-8 frames) \- Smooth walking cycle.  
  * Crouch: (1-2 frames) \- Crouched defensive position.  
  * Jump: (3 frames) \- Up, Apex, Down.  
  * Light Punch (LP): (2-3 frames) \- Quick jab.  
  * Medium Punch (MP): (3-4 frames) \- Straight punch.  
  * Heavy Punch (HP): (4-6 frames) \- Slower, powerful punch with wind-up.  
  * Special Move: (8-12 frames) \- A unique, flashy attack (e.g., an energy punch).  
  * Take Hit: (2-3 frames) \- Character recoils from a hit.  
  * Block Stance: (1 frame) \- Defensive guard pose.  
  * Dizzy: (4-6 frames) \- Looping animation of being stunned.  
  * Throw/Grapple: (4-6 frames) \- Animation for grabbing and throwing the opponent.  
  * Win Pose: (6-8 frames) \- Victory animation (e.g., flexing).  
  * Lose Pose/Defeated: (4-6 frames) \- Kneeling in defeat.  
* **Meta-Game Animations (for Home Screen):**  
  * Idle: (4-6 frames) \- Default breathing/looking around animation.  
  * Positive Reaction: (3-5 frames) \- Happy animation for stat increases.  
  * Negative Reaction: (3-5 frames) \- Sad/slumped animation for stat decreases.  
  * Evolution Transform: (8-10 frames) \- A glowing, transformative animation used in the Evolution Ceremony.

#### **1.2. Boss Characters (One complete set required for EACH boss)**

* **Boss 1: Training Dummy**  
  * Idle: (1 frame) \- Stationary.  
  * Take Hit: (2 frames) \- Recoils/shakes when hit.  
  * Defeated: (3 frames) \- Falls apart/deactivates.  
* **Boss 2-6: Procrastination Phantom, Sloth Demon, Gym Bully, Stress Titan, Ultimate Slump**  
  * Idle Stance: (4-6 frames)  
  * Movement: (6-8 frames) \- Walk, dash, or float cycle.  
  * Primary Attack: (4-6 frames) \- The boss's main attack.  
  * Secondary/Special Attack: (6-10 frames) \- A more powerful or unique move.  
  * Take Hit: (2-3 frames)  
  * Defeated: (6-8 frames) \- A unique defeat animation for each boss.

### **2\. Audio Files**

*All audio must be in a 16-bit chiptune style.*

#### **2.1. Music Tracks (Looping)**

* M\_Theme\_Main: Upbeat, motivational track for the Home Screen and menus.  
* M\_Theme\_Battle: Intense, fast-paced track for standard battles.  
* M\_Theme\_FinalBoss: A more epic and dramatic version of the battle theme for the "Ultimate Slump."  
* M\_Jingle\_Victory: (5 sec) \- A short, triumphant jingle for winning a battle.  
* M\_Jingle\_Defeat: (5 sec) \- A short, somber tune for losing a battle.  
* M\_Jingle\_Evolution: (8 sec) \- A powerful, ascending track for the Evolution Ceremony.

#### **2.2. Sound Effects (SFX)**

* **UI SFX:**  
  * SFX\_UI\_Navigate: A sharp, quick beep for button presses.  
  * SFX\_UI\_Confirm: A positive confirmation sound.  
  * SFX\_UI\_Cancel: A soft negative/back-out sound.  
  * SFX\_Stat\_Increase: A short, ascending chime.  
  * SFX\_Stat\_Decrease: A short, descending buzz.  
  * SFX\_Achievement: A classic "treasure found" sound.  
* **Combat SFX:**  
  * SFX\_Attack\_Whoosh\_Light  
  * SFX\_Attack\_Whoosh\_Heavy  
  * SFX\_Hit\_Light  
  * SFX\_Hit\_Medium  
  * SFX\_Hit\_Heavy  
  * SFX\_Block  
  * SFX\_Jump  
  * SFX\_Land  
  * SFX\_Special\_Activate  
  * SFX\_Dizzy\_Start  
  * SFX\_Throw\_Connect

### **3\. UI & Environment Assets**

*All assets must be in a 16-bit pixel art style, adhering to the specified color palettes.*

* **Logos & Icons:**  
  * Logo\_16BitFit\_Full: The main app logo for the Welcome Screen.  
  * App\_Icon\_512x512: The app icon for the App Stores.  
  * Icon\_Set: A set of pixel art icons for Battle, Train, Feed, Stats, etc.  
* **Backgrounds & Environments:**  
  * BG\_Battle\_TrainingRoom: The stage for the Training Dummy.  
  * BG\_Battle\_Phantom: The stage for the Procrastination Phantom.  
  * BG\_Battle\_Sloth: The stage for the Sloth Demon.  
  * BG\_Battle\_Bully: The stage for the Gym Bully.  
  * BG\_Battle\_Titan: The stage for the Stress Titan.  
  * BG\_Battle\_Slump: The stage for the Ultimate Slump.  
* **UI Components:**  
  * UI\_Button\_Frame\_Active: The border/frame for primary buttons.  
  * UI\_Button\_Frame\_Disabled: The border/frame for disabled buttons.  
  * UI\_Panel\_Frame: The frame for info panels on the Stats screen.  
  * UI\_HealthBar\_Container: The empty container for health/stat bars.  
  * UI\_HealthBar\_Fill: The texture for the filled portion of the health bar.