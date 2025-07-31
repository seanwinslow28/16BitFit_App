### **1\. Introduction & Vision**

* **Product:** 16BitFit  
* **Vision:** To transform fitness from a chore into a compelling, skill-based retro gaming experience. We empower users to level up their real-life health by rewarding their efforts with tangible power in a game they love to play.  
* **Scope:** This document covers the requirements for the Minimum Viable Product (MVP) as defined in Phase 1 of the Product Roadmap.

### **2\. Goals & Objectives**

* **Primary Business Goal:** Validate the core motivational loop: that users will consistently log fitness activities in exchange for power in a skill-based fighting game.  
* **Primary User Goal:** Provide "Retro Gamer Ryan" and "Goal-Oriented Gina" with a fun, engaging, and rewarding fitness experience that respects their time and motivations.  
* **Key Objectives for MVP:**  
  * Achieve a Day-7 retention rate of 20% or higher.  
  * Prove technical feasibility of the Phaser 3 engine within a React Native WebView for a 60fps fighting game experience.  
  * Receive qualitative feedback from users indicating that the core gameplay loop is "fun" and "motivating."

### **3\. Feature Requirements**

#### **Epic: Foundational User Experience**

* **FE-1: Guest Onboarding**  
  * **Requirement:** The app must provide a skippable, 60-second onboarding flow for new users without requiring immediate account creation.  
  * **User Story:** As a new user, I want to try the app's core loop immediately so I can understand its value before committing to creating an account.  
  * **Acceptance Criteria:**  
    1. User is presented with a Welcome Screen, Archetype Selection, and a one-tap sample Activity Log.  
    2. Upon logging the sample activity, a dynamic "Power-Up" animation is shown.  
    3. User lands on the Home Screen with the "Battle" button highlighted.  
* **FE-2: Core Screens**  
  * **Requirement:** The app must include three primary navigation screens: Home, Battle, and Stats.  
  * **Acceptance Criteria:**  
    1. **Home Screen:** Displays the user's animated avatar, current core stats (Health, Strength, Stamina), and primary action buttons (Train, Feed, Battle).  
    2. **Battle Screen:** Provides access to the "Quick Battle" (Training Dummy) and a disabled "Boss Fight" option.  
    3. **Stats Screen:** Displays a detailed view of the user's core stats, level, and XP progress.  
* **FE-3: Activity Logging**  
  * **Requirement:** Users must be able to log workouts and basic nutritional information.  
  * **User Story:** As a user, I want to quickly log my workout or meal so I can see my character's stats increase immediately.  
  * **Acceptance Criteria:**  
    1. The "Train" screen must present options for different workout types (e.g., Cardio, Strength).  
    2. The "Feed" screen must present simple options (e.g., "Healthy Meal," "Junk Food").  
    3. Logging an activity must provide immediate visual feedback (stat bars filling up) and trigger a positive character animation.

#### **Epic: Avatar Progression System**

* **AP-1: 5-Stage Evolution**  
  * **Requirement:** The user's avatar must visually evolve through five distinct stages based on the number of logged workouts.  
  * **User Story:** As "Goal-Oriented Gina," I want to see my character visually transform as I hit my workout milestones so I feel a strong sense of progression and achievement.  
  * **Acceptance Criteria:**  
    1. Each of the 5 stages (Basic, Intermediate, Advanced, Master, Legend) must have a unique 16-bit sprite sheet.  
    2. Evolution is triggered automatically upon reaching the required workout log count (10, 30, 50, 75).  
* **AP-2: Evolution Ceremony**  
  * **Requirement:** An animated sequence must play when an avatar evolves to the next stage.  
  * **Acceptance Criteria:**  
    1. The ceremony must include a background fade, character transformation animation, and text announcing the new stage.  
    2. The sequence must be visually impressive and feel like a significant reward.

#### **Epic: Boss Battle V1 (Phaser 3 Engine)**

* **BB-1: Technical Migration & Performance**  
  * **Requirement:** The battle system must be built using the Phaser 3 game engine and rendered within a React Native WebView.  
  * **Non-Functional Requirement:** The battle gameplay **must** maintain a consistent 60 frames per second (fps) on target devices.  
  * **Acceptance Criteria:**  
    1. A WebView component successfully loads and runs a Phaser 3 game instance.  
    2. Communication between React Native (for stats) and the Phaser WebView (for gameplay) is established and functional.  
* **BB-2: Fighting Game Mechanics**  
  * **Requirement:** The combat must implement the core mechanics of a 2D fighting game.  
  * **User Story:** As "Retro Gamer Ryan," I want a combat system with real depth, including movement, blocking, and special moves, so I feel that my skill matters in battle.  
  * **Acceptance Criteria:**  
    1. On-screen controls must be available for movement (left/right), jumping, blocking, and at least three attack buttons (e.g., Light, Medium, Heavy Punch).  
    2. A dedicated "Special Move" button must be present.  
    3. The player's core stats (Health, Strength, Stamina) must directly influence their in-game health pool, damage output, and ability to perform special moves.  
* **BB-3: Initial Boss Roster**  
  * **Requirement:** The MVP must include a training dummy and five unique bosses.  
  * **Acceptance Criteria:**  
    1. A "Training Dummy" boss is available for players to practice mechanics without risk.  
    2. Five bosses (Procrastination Phantom, Sloth Demon, Gym Bully, Stress Titan, Ultimate Slump) are implemented, each with a unique visual design and a distinct, predictable AI attack pattern.

#### **Epic: Backend & Analytics**

* **BE-1: User Data Persistence**  
  * **Requirement:** User progress (stats, evolution stage, workouts logged) must be saved and persist between sessions.  
  * **Acceptance Criteria:**  
    1. A user's state is saved to a backend database upon any change.  
    2. When a user re-opens the app, their last saved state is loaded correctly.  
* **BE-2: Core Analytics Tracking**  
  * **Requirement:** The app must track key events to measure the success of the MVP objectives.  
  * **Acceptance Criteria:**  
    1. Events for onboarding\_complete, workout\_logged, boss\_defeated, and user\_retained\_day\_7 must be tracked.

### **4\. Design & UX Requirements**

* **Visual Style:** All UI and game assets must adhere to a high-fidelity 16-bit pixel art aesthetic.  
* **Color Palette:** Primary: Game Boy Green (\#9BBD0F), Background: Dark Green (\#0F380F), Accent: Gold (\#FFD700).  
* **Typography:** The primary font must be PressStart2P.  
* **Sound:** The app must include retro-style chiptune music and sound effects for UI interactions, stat increases, and combat.

### **5\. Out of Scope for MVP**

* **Social Features:** No leaderboards, user profiles, friend systems, or PvP of any kind.  
* **Advanced Content:** No guilds, weekly challenges, or super combos.  
* **Full Account System:** Onboarding is guest-only. Full email/social login will be in a future release.  
* **Advanced Fitness/Nutrition Tracking:** No detailed macro tracking or complex workout plan integration.