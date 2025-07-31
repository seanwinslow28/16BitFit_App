### **1\. General Principles**

* **Focus:** These wireframes are low-fidelity. The goal is to define structure, information hierarchy, and functionality. Do not use color, specific fonts, or final pixel art. Use simple boxes, lines, and placeholder text (Lorem Ipsum is acceptable for descriptions).  
* **Clarity over Beauty:** The layout must be clear and unambiguous. Every button and interactive element should be clearly labeled with its action.  
* **Consistency:** Elements that appear on multiple screens (like a header or navigation) should be consistent in placement and style.

### **2\. Onboarding Flow Wireframes (4 Screens)**

#### **Screen 1: Welcome**

* **Layout:** Centered, single-column.  
* **Components:**  
  1. **\[LOGO AREA\]:** Large box at the top for the 16BitFit logo.  
  2. **\[HEADLINE TEXT\]:** "TRANSFORM FITNESS INTO VICTORIES"  
  3. **\[SUBTITLE TEXT\]:** "Log workouts → Power up character → Win battles"  
  4. **\[PRIMARY BUTTON\]:** Large, full-width button at the bottom labeled "START".

#### **Screen 2: Choose Archetype**

* **Layout:** Centered, three-column or vertical stack.  
* **Components:**  
  1. **\[HEADLINE TEXT\]:** "CHOOSE YOUR FIGHTING STYLE"  
  2. **\[CARD 1\]:** A tappable card element.  
     * **\[ICON\]:** Simple "💪" icon.  
     * **\[TITLE TEXT\]:** "POWER"  
     * **\[DESCRIPTION TEXT\]:** "Focus on building strength."  
  3. **\[CARD 2\]:** A tappable card element.  
     * **\[ICON\]:** Simple "⚡" icon.  
     * **\[TITLE TEXT\]:** "SPEED"  
     * **\[DESCRIPTION TEXT\]:** "Focus on boosting stamina."  
  4. **\[CARD 3\]:** A tappable card element.  
     * **\[ICON\]:** Simple "⚖️" icon.  
     * **\[TITLE TEXT\]:** "BALANCE"  
     * **\[DESCRIPTION TEXT\]:** "Focus on all-around fitness."

#### **Screen 3: Log First Activity**

* **Layout:** Centered, vertical list.  
* **Components:**  
  1. **\[HEADLINE TEXT\]:** "LOG YOUR FIRST ACTIVITY"  
  2. **\[BUTTON 1\]:** Large button labeled "GYM 🏋️ (30 min)".  
  3. **\[BUTTON 2\]:** Large button labeled "RUN 🏃 (20 min)".  
  4. **\[BUTTON 3\]:** Large button labeled "WALK 🚶 (15 min)".

### **3\. Core App Wireframes**

#### **Screen 4: Home Screen**

* **Layout:** Three distinct horizontal sections.  
* **Components:**  
  1. **\[SECTION 1: CHARACTER DISPLAY (Top 50% of screen)\]**  
     * **\[AVATAR AREA\]:** A large, central box representing the animated character sprite.  
     * **\[STAT BARS\]:** Three horizontal bars stacked vertically on the left or right of the avatar.  
       * Label: "HP" | \[--------------------\]  
       * Label: "STR" | \[--------------------\]  
       * Label: "STA" | \[--------------------\]  
     * **\[DAILY QUEST BOX\]:** A small banner overlaid at the top, e.g., "Daily Quest: Log 1 Workout".  
  2. **\[SECTION 2: PRIMARY ACTIONS (Middle 25%)\]**  
     * A two-column grid of large, square buttons.  
     * **\[BUTTON 1\]:** Labeled "⚔️ BATTLE". *Instruction: This button should have a "highlighted" or "glowing" state defined for the onboarding flow.*  
     * **\[BUTTON 2\]:** Labeled "💪 TRAIN".  
  3. **\[SECTION 3: SECONDARY ACTIONS (Bottom 25%)\]**  
     * **\[DISCLOSURE BUTTON\]:** A small button labeled "▼ MORE ▼".  
     * **(On Tap) \-\> \[EXPANDED MENU\]:** Reveals two smaller buttons below "BATTLE" and "TRAIN".  
       * **\[BUTTON 3\]:** Labeled "🍎 FEED".  
       * **\[BUTTON 4\]:** Labeled "📊 STATS".

#### **Screen 5: Battle Menu**

* **Layout:** Centered, vertical list.  
* **Components:**  
  1. **\[HEADLINE TEXT\]:** "BATTLE MODE"  
  2. **\[PRIMARY BUTTON\]:** Large, active button labeled "QUICK BATTLE".  
  3. **\[SECONDARY BUTTON\]:** Large, disabled/grayed-out button labeled "BOSS FIGHT".  
     * **\[SUB-LABEL TEXT\]:** "Coming Soon" below the button label.

#### **Screen 6: Battle Screen (Phaser WebView)**

* **Layout:** Classic 2D fighting game layout.  
* **Components:**  
  1. **\[GAME VIEW (Main Area)\]:** This is the container for the Phaser WebView.  
     * **\[PLAYER SPRITE\]:** Placeholder on the left.  
     * **\[ENEMY SPRITE\]:** Placeholder on the right.  
  2. **\[TOP HUD (Header)\]**  
     * **\[PLAYER 1 HUD (Left)\]:**  
       * "P1" Label  
       * \[HEALTH BAR\]  
     * **\[TIMER (Center)\]:** "99"  
     * **\[PLAYER 2 HUD (Right)\]:**  
       * "CPU" Label  
       * \[HEALTH BAR\]  
  3. **\[BOTTOM CONTROLS (Footer)\]**  
     * **\[D-PAD (Left)\]:** A container with four directional inputs (Left, Right, Up/Jump).  
     * **\[ACTION BUTTONS (Right)\]:** A cluster of circular buttons.  
       * Three smaller buttons in a row: "LP", "MP", "HP".  
       * One larger button below: "SPL" (Special).  
       * A "Block" button can be placed near the D-pad or action buttons.

#### **Screen 7: Stats Screen**

* **Layout:** Vertical list/information display.  
* **Components:**  
  1. **\[HEADLINE TEXT\]:** "STATISTICS"  
  2. **\[CHARACTER BOX\]:** A small preview box showing the static character sprite.  
  3. **\[STATS SECTION\]:**  
     * **\[STAT 1\]:** Label: "HEALTH" | \[Health Bar\] | "XX / 100"  
     * **\[STAT 2\]:** Label: "STRENGTH" | \[Strength Bar\] | "XX / 100"  
     * **\[STAT 3\]:** Label: "STAMINA" | \[Stamina Bar\] | "XX / 100"  
  4. **\[PROGRESSION SECTION\]:**  
     * **\[LEVEL TEXT\]:** "LEVEL: X"  
     * **\[XP BAR\]:** \[Experience Bar\] | "XXX / XXX XP"