### **1\. Core Concept & Vision**

* **Concept:** A single-player, gamified fitness RPG where users train in real life to power up a 16-bit avatar, then use that avatar to fight in a skill-based, retro fighting game.  
* **Core Fantasy:** To make users feel like their real-world exercise is the "training montage" for an epic video game boss battle.  
* **Design Pillars:**  
  1. **Real Effort, Real Power:** Every logged workout directly and visibly enhances the player's in-game capabilities.  
  2. **Skill Matters:** Victory in battle is determined by a combination of the player's stats (from fitness) and their skill in the fighting game.  
  3. **Nostalgic Motivation:** Use the aesthetics and challenge of the 16-bit era to make fitness an engaging and rewarding experience.

### **2\. The Core Gameplay Loop**

*The gameplay is divided into two interconnected loops: the **Meta-Game Loop** (daily fitness habits) and the **Core Game Loop** (the fighting game).*

1. **TRAIN (Meta-Game):** The user logs a real-world workout or meal.  
2. **POWER UP (Meta-Game):** The user's character stats (Health, Strength, Stamina) and XP increase instantly, providing immediate positive feedback.  
3. **BATTLE (Core Game):** The user takes their powered-up character into a skill-based fight against an AI opponent.  
4. **EVOLVE (Meta-Game):** After reaching workout milestones, the character undergoes a major transformation, permanently increasing their base power and unlocking a new visual form. This encourages the player to return to Step 1\.

### **3\. Meta-Game Mechanics: Fitness & Progression**

* **Primary Stats:**  
  * **Health (HP):** Represents overall wellness. Increased by healthy eating and cardio. Determines the character's health pool in battles.  
  * **Strength (STR):** Represents physical power. Increased by strength training. Determines damage output of attacks in battles.  
  * **Stamina (STA):** Represents energy and endurance. Increased by cardio and conditioning. Determines the "Special Meter" resource for performing special moves in battles.  
* **Stat Calculation:**  
  * Logging a "Strength" workout adds \+5 STR, \+1 STA.  
  * Logging a "Cardio" workout adds \+4 STA, \+2 HP.  
  * Logging a "Healthy Meal" adds \+3 HP.  
  * Logging "Junk Food" subtracts \-2 HP, \-1 STA.  
  * *Note: These are base values and will be balanced during development.*  
* **Experience (XP) and Leveling:**  
  * Every logged activity grants XP.  
  * Gaining enough XP increases the character's Level.  
  * Each Level provides a minor passive boost to all stats, making the character slightly stronger even before specific training.  
* **Avatar Evolution System:**  
  * Evolution is the primary long-term progression system, triggered by consistency.  
  * **Stage 1 (Basic):** Unlocked at start.  
  * **Stage 2 (Intermediate):** Unlocked after 10 logged workouts.  
  * **Stage 3 (Advanced):** Unlocked after 30 logged workouts.  
  * **Stage 4 (Master):** Unlocked after 50 logged workouts.  
  * **Stage 5 (Legend):** Unlocked after 75 logged workouts.  
  * Each evolution provides a significant boost to base stats and a complete visual transformation of the avatar.

### **4\. Core Game Mechanics: The Fighting Engine**

*This system must be built in Phaser 3 to achieve the required performance and feel. The design is heavily inspired by Street Fighter II Turbo.*

* **Controls:**  
  * **Movement:** On-screen D-pad for left/right movement and crouching. Up on the D-pad is for jumping.  
  * **Attacks:** Three primary attack buttons: Light Punch (LP), Medium Punch (MP), Heavy Punch (HP). These can be combined with D-pad directions for different attacks (e.g., crouching MP).  
  * **Special Move:** A single "SPL" button. When the Special Meter is full, pressing this button executes a character-specific special move.  
  * **Blocking:** Holding "back" on the D-pad when an opponent attacks.  
* **Combat Mechanics:**  
  * **Combos:** Attacks will be "linkable." A fast attack (like a LP) can be followed by a slower, more powerful attack (like a MP) if timed correctly, creating a combo.  
  * **Throws/Grapples:** When very close to an opponent, pressing an attack button will initiate a throw. This is used to counter players who are blocking too much.  
  * **Special Meter:** The Stamina (STA) stat from the meta-game determines the size and fill-rate of the Special Meter. The meter fills as the player lands attacks and takes damage.  
  * **Dizzy/Stun State:** Taking too many hits in a short period will put a character into a temporary "dizzy" state where they are vulnerable to a free attack.

### **5\. MVP Opponent Roster (The Bosses)**

*Each boss is designed to test a specific aspect of the player's skill and stats.*

1. **Training Dummy:**  
   * **Theme:** A simple, stationary target.  
   * **Behavior:** Does not attack. Allows the player to practice movement, combos, and special moves freely.  
2. **Procrastination Phantom:**  
   * **Theme:** A ghostly, evasive figure.  
   * **Behavior:** Frequently dashes back and forth, forcing the player to work on their timing and positioning (zoning).  
3. **Sloth Demon:**  
   * **Theme:** A slow, heavy-hitting tank.  
   * **Behavior:** Moves slowly but has powerful, telegraphed attacks. Teaches the player the importance of blocking and punishing slow moves. Requires high Strength to damage effectively.  
4. **Gym Bully:**  
   * **Theme:** An aggressive, rushdown-style character.  
   * **Behavior:** Constantly moves forward and uses rapid attacks. Teaches the player how to use blocking and fast counter-attacks (like LP) to interrupt pressure.  
5. **Stress Titan:**  
   * **Theme:** A large boss with powerful ranged attacks.  
   * **Behavior:** Tries to keep the player at a distance with projectiles. Teaches the player how to time their jumps and advance safely. Requires high Health to withstand chip damage from blocking projectiles.  
6. **Ultimate Slump:**  
   * **Theme:** A final boss that combines elements of the previous bosses.  
   * **Behavior:** Has multiple phases, requiring the player to demonstrate mastery of all learned mechanics.

### **6\. Art & Sound Direction**

* **Art Style:** High-fidelity 16-bit pixel art. All in-game assets (character sprites, backgrounds, projectiles) must adhere to the 4-color "Green Screen" palette. All UI elements must use the Game Boy-inspired shell color palette.  
* **Animation:** All animations must run at a target of 60fps to ensure smooth and responsive gameplay. Key animations include idle stances, walk cycles, attack frames, hit-stun reactions, and a dizzy state animation.  
* **Sound Design:**  
  * **Music:** An original, looping 16-bit chiptune track for the battle screen that is energetic and motivational.  
  * **Sound Effects (SFX):** Distinct, impactful sounds for punches, kicks, blocks, special moves, and landing hits. UI sounds should be simple, satisfying clicks and beeps.